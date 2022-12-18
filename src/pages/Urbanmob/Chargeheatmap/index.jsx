import React, { useEffect, useState, useCallback } from 'react'
import ReactECharts from 'echarts-for-react';
import { Button, Col, Card, Collapse, Tooltip, message, Select, Row, Space, Slider } from 'antd';

import {
    InfoCircleOutlined
} from '@ant-design/icons';

//redux
import { useDispatch, useMappedState } from 'redux-react-hook'
import {

    setselected_area_tmp,
    setcharged_power_tmp,
    setpotential_power_tmp,
    setdrawMode_tmp,
    setheatmap_data_tmp,
    setradiusPixels_tmp,
    setintensity_tmp,
    setthreshold_tmp
} from '@/redux/actions/evdata'
import * as dfd from "danfojs";
import * as turf from '@turf/turf'
const { Panel } = Collapse;
const { Option } = Select;
export default function Areapowerload() {

    /*
  ---------------redux中取出变量---------------
*/
    //#region
    const mapState = useCallback(
        state => ({
            evdata: state.evdata
        }),
        []
    );
    const { evdata } = useMappedState(mapState);
    const { potential_power, charged_power, selected_area, drawMode,
        radiusPixels,
        intensity,
        threshold } = evdata
    //dispatch

    const dispatch = useDispatch()
    const setcharged_power = (data) => {
        dispatch(setcharged_power_tmp(data))
    }
    const setpotential_power = (data) => {
        dispatch(setpotential_power_tmp(data))
    }
    const setselected_area = (data) => {
        dispatch(setselected_area_tmp(data))
    }
    const setdrawMode = (data) => {
        dispatch(setdrawMode_tmp(data))
    }
    const setheatmap_data = (data) => {
        dispatch(setheatmap_data_tmp(data))
    }
    const setradiusPixels = (data) => {
        dispatch(setradiusPixels_tmp(data))
    }
    const setintensity = (data) => {
        dispatch(setintensity_tmp(data))
    }
    const setthreshold = (data) => {
        dispatch(setthreshold_tmp(data))
    }

    const [chargetype, setChargetype] = useState('实际充电需求')
    const [starttime, setStarttime] = useState(0)
    const [endtime, setEndtime] = useState(23)
    const [weekdays, setWeekdays] = useState([0, 1, 2, 3, 4, 5, 6])

    //
    useEffect(() => {
        let chargedata = []
        if (chargetype == "实际充电需求") {
            chargedata = charged_power.map(f => { return { ...f, power: f.charged_power } })
        } else {
            chargedata = potential_power.map(f => { return { ...f, power: f.potential_power } })
        }
        //时间段筛选
        if (starttime <= endtime) {
            //当天
            chargedata = chargedata.filter(f => (f.hour >= starttime) & (f.hour <= endtime))
        } else {
            //隔天
            chargedata = chargedata.filter(f => (f.hour < endtime) | (f.hour >= starttime))
        }
        //日期筛选
        chargedata = chargedata.filter(f => weekdays.indexOf(f.weekday) != -1)
        setheatmap_data(chargedata)

    }, [chargetype, starttime, endtime, weekdays])


    return (
        <>
            <Col span={24}>
                <Card title="充电需求热力图" extra={<Tooltip title='Click on the bars to show trajectories.'><InfoCircleOutlined /></Tooltip>}
                    bordered={false}>
                    <Collapse defaultActiveKey={['panel1', 'panel2']}>
                        <Panel header="时间段筛选" key="panel1">
                            <Space direction="vertical" >
                                <Space>
                                    类型：
                                    <Select style={{ width: 130 }} value={chargetype}
                                        onChange={setChargetype}
                                        options={['实际充电需求', '潜在充电需求'].map(f => { return { label: f, value: f } })}
                                    >
                                    </Select>
                                </Space>
                                <Space>
                                    时间段：
                                    <Select
                                        value={starttime}
                                        onChange={setStarttime}
                                        style={{ width: 81 }}>
                                        {Array.from(Array(23 - 0 + 1)).map((e, i) => 0 + i).map(f => <Option key={'starttime' + f} value={f}>{f + ':00'}</Option>)}
                                    </Select >
                                    至
                                    <Select
                                        value={endtime}
                                        onChange={setEndtime}
                                        style={{ width: 81 }}>
                                        {Array.from(Array(23 - 0 + 1)).map((e, i) => 0 + i).map(f => <Option key={'endtime' + f} value={f}>{f + ':00'}</Option>)}
                                    </Select>
                                    {starttime <= endtime ? starttime + ':00~' + endtime + ':00' : '0:00~' + endtime + ':00 和 ' + starttime + ':00~24:00'}

                                </Space>
                                <Space>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{
                                            width: '460px',
                                        }}
                                        placeholder="Please select"
                                        value={weekdays}
                                        onChange={setWeekdays}
                                        options={['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((f, i) => {
                                            return { label: f, value: i }
                                        })}
                                    />
                                </Space>
                            </Space>
                        </Panel>
                        <Panel header="热力图参数" key="panel2">
                            <Space direction="vertical">
                                <Space>
                                    半径：
                                    <Slider
                                        style={{
                                            width: '200px',
                                        }}
                                        min={1}
                                        max={50}
                                        onChange={setradiusPixels}
                                        value={radiusPixels}
                                        step={1}
                                    />
                                </Space>
                                <Space>
                                    强度：
                                    <Slider
                                        style={{
                                            width: '200px',
                                        }}
                                        min={0.1}
                                        max={5}
                                        onChange={setintensity}
                                        value={intensity}
                                        step={0.1}
                                    />
                                </Space>
                                <Space>
                                    阈值：
                                    <Slider
                                        style={{
                                            width: '200px',
                                        }}
                                        min={0}
                                        max={1}
                                        onChange={setthreshold}
                                        value={threshold}
                                        step={0.01}
                                    />
                                </Space>
                            </Space>
                        </Panel>
                    </Collapse>
                </Card>
            </Col>
        </>
    )

}