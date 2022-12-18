import React, { useState, useCallback, useEffect } from 'react'
import { Form, InputNumber, Table, Alert, Col, Card, Row, Collapse, Button } from 'antd';

//redux
import { useDispatch, useMappedState } from 'redux-react-hook'
//redux变量控制
import {
    setviewStates_tmp,
    setfpvsize_tmp
} from '@/redux/actions/Visualcamera'
import { useInterval } from 'ahooks';
import { publish } from 'pubsub-js';

const { Panel } = Collapse;

export default function Visualcamera() {
    /*
        ---------------redux中取出变量---------------
      */
    //#region
    //state，从store中取出状态
    const mapState = useCallback(
        state => ({
            Visualcamera: state.Visualcamera,
        }),
        []
    );
    const { Visualcamera } = useMappedState(mapState);
    const { fpvsize, viewStates } = Visualcamera
    //dispatch
    const dispatch = useDispatch()
    const setViewStates = (data) => {
        dispatch(setviewStates_tmp(data))
    }
    const setfpvsize = (data) => {
        dispatch(setfpvsize_tmp(data))
    }
    //#endregion
    /*
    ---------------镜头变化---------------
  */
    //#region
    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    useEffect(() => {
        form.setFieldsValue({
            longitude: viewStates.firstPerson.longitude,
            latitude: viewStates.firstPerson.latitude,
            bearing: viewStates.firstPerson.bearing,
            pitch: viewStates.firstPerson.pitch,
            fovy: viewStates.firstPerson.fovy,
            z: viewStates.firstPerson.position[2]
        })
        form2.setFieldsValue(fpvsize)
    }, [viewStates, fpvsize])



    //#endregion
    /*
    ---------------镜头数据切换---------------
  */
    //#region
    const [cameradata, setcameradata] = useState([])

    //播放
    const [interval, setInterval] = useState(undefined);
    const [playframe, setplayframe] = useState(0);

    const [finished, setfinished] = useState(false);

    // 生成图片自动下载为png格式（将dom转为二进制再编译下载）

    const screenshot = (filename) => {
        publish('screenshot', filename)
    }
    //帧
    useInterval(() => {
        //下一个画面
        setViewStates_form(cameradata[playframe])

        const filename = cameradata[playframe].longitude + ',' +
            cameradata[playframe].latitude + ',' +
            cameradata[playframe].z + ',' +
            cameradata[playframe].bearing + ',' +
            cameradata[playframe].pitch + ',' +
            cameradata[playframe].fovy
        //稍等一下再截图
        setTimeout(() => {
            screenshot(filename)
        }, 50)
        //如果是最后一帧了，停止
        if (playframe >= cameradata.length - 1) {
            setInterval(undefined)
            setfinished(true)
            setplayframe(0)
            setTimeout(() => {
                setfpvsize({ width: 29, height: 50 })
            }, 50)
        } else {
            setplayframe(playframe + 1)
        }
    }, interval, { immediate: true });

    const onApply = () => {
        if (interval != 100) {
            setfinished(false)
            setInterval(100)
            setfpvsize({ width: 100, height: 100 })
        } else {
            setInterval(undefined)
            setfpvsize({ width: 29, height: 50 })
        }
    }

    const setViewStates_form = (formval) => {
        setViewStates({
            baseMap: {
                ...viewStates.baseMap,
                longitude: formval.longitude,
                latitude: formval.latitude,
                bearing: formval.bearing,
            },
            firstPerson: {
                ...viewStates.firstPerson,
                longitude: formval.longitude,
                latitude: formval.latitude,
                bearing: formval.bearing,
                pitch: formval.pitch,
                fovy: formval.fovy,
                position: [0, 0, formval.z]
            }
        })
    }
    const onFormChange = () => {
        const formval = form.getFieldValue()
        setViewStates_form(formval)
    }

    function readURL(file) {
        var reader = new FileReader()
        reader.readAsText(file.target.files[0])
        reader.onload = function (f) {
            const data = JSON.parse(f.target.result)
            setcameradata(data)
            setViewStates_form(data[0])
        }
    }
    //#endregion
    /*
    ---------------渲染页面---------------
  */
    //#region
    return (
        <>
            <Row gutter={8} justify="center" align="top">
                <Col span={24}>
                    <Card title="Camera settings"
                        bordered={false}>
                        <Collapse defaultActiveKey={['Camera-Settings', 'Camera-data']} >
                            <Panel header="Camera settings" key="Camera-Settings">
                                <Form
                                    {...{
                                        labelCol: { span: 8 },
                                        wrapperCol: { span: 0 },
                                    }}
                                    form={form}

                                    onValuesChange={onFormChange}
                                >
                                    <Row span={3}>
                                        <Col span={8}>
                                            <Form.Item name="longitude" label="lon">
                                                <InputNumber min={-180} max={180} step={0.000002} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="latitude" label="lat">
                                                <InputNumber min={-90} max={90} step={0.000002} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="z" label="height">
                                                <InputNumber min={0} step={0.1} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="bearing" label="bearing">
                                                <InputNumber min={-360} max={360} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="pitch" label="pitch">
                                                <InputNumber min={-90} max={90} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="fovy" label="fovy">
                                                <InputNumber min={0} max={180} step={1} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form>
                                <Form
                                    form={form2}
                                    {...{
                                        labelCol: { span: 8 },
                                        wrapperCol: { span: 0 },
                                    }}
                                    onValuesChange={() => {
                                        const data = form2.getFieldValue()
                                        setfpvsize({
                                            width: Math.max(1, data.width),
                                            height: Math.max(1, data.height),
                                        })
                                    }}
                                >
                                    <Row span={3}>
                                        <Col span={8}>
                                            <Form.Item name="width" label="width">
                                                <InputNumber min={1} max={100} step={5} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="height" label="height">
                                                <InputNumber id="height" min={1} max={100} step={5} />
                                            </Form.Item>
                                        </Col>

                                    </Row>
                                </Form>
                            </Panel>
                            <Panel header="Camera data" key="Camera-data">
                                <input type='file' id='readfile' onChange={readURL}></input>
                                {cameradata.length > 0 ? <Table size='small' dataSource={cameradata}
                                    footer={() => {
                                        return (<Button onClick={onApply}>Generate screenshot</Button>)
                                    }}
                                    columns={[
                                        {
                                            title: 'lon',
                                            dataIndex: 'longitude',
                                            key: 'longitude',
                                        },
                                        {
                                            title: 'lat',
                                            dataIndex: 'latitude',
                                            key: 'latitude',
                                        }, {
                                            title: 'height',
                                            dataIndex: 'z',
                                            key: 'z',
                                        }, {
                                            title: 'bearing',
                                            dataIndex: 'bearing',
                                            key: 'bearing',
                                        }, {
                                            title: 'pitch',
                                            dataIndex: 'pitch',
                                            key: 'pitch',
                                        }, {
                                            title: 'fovy',
                                            dataIndex: 'fovy',
                                            key: 'fovy',
                                        },
                                    ]}>
                                </Table> : <></>}
                                {finished ? <Alert message="Finished" type="success" /> : <></>}
                            </Panel>
                        </Collapse>
                    </Card>
                </Col>
            </Row>
        </>
    )
}