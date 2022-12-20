import React, { useEffect, useState, useCallback } from 'react'
import ReactECharts from 'echarts-for-react';
import { Button, Col, Card, Collapse, Tooltip, message } from 'antd';
import {
    InfoCircleOutlined
} from '@ant-design/icons';

//redux
import { useDispatch, useMappedState } from 'redux-react-hook'
import {

    setselected_area_tmp,
    setcharged_power_tmp,
    setpotential_power_tmp,
    setdrawMode_tmp
} from '@/redux/actions/evdata'
import axios from 'axios';
import * as dfd from "danfojs";
import * as turf from '@turf/turf'
import { downloadFile } from '@/utils/downloadFile';

const { Panel } = Collapse;
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
    const { potential_power, charged_power, selected_area, drawMode } = evdata
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
    useEffect(() => {
        axios.get(`data/charged_power.json`).then(response => {
            setcharged_power(response.data)
        })
        axios.get(`data/potential_power.json`).then(response => {
            setpotential_power(response.data)
        })

    }, [])

    //创建选区，取消区
    function CreateArea() {
        message.info('编辑模式已开启，请点击地图选区，双击结束选择');
        setdrawMode(0)
    }
    function ClearArea() {
        setselected_area({ //空白选区
            type: 'FeatureCollection',
            features: [],
        })
    }
    //#endregion
    const [option, setEchartsOption] = useState({})
    const [option2, setEchartsOption2] = useState({})
    //如果选区发生改变
    useEffect(() => {
        //数据集计
        //const colors = ['#cadeea', '#a6bdd7', '#899dc2', '#737fad', '#5b5d8d', '#423b67', '#281e3b']
        const colors = ['#cadeea', '#a6bdd7', '#899dc2', '#737fad', '#5b5d8d', '#bf8a9d', '#ac89a3']
        if (selected_area.features.length > 0) {
            if (charged_power.length > 0) {
                let charged_power_selected = []
                //进行区域筛选

                charged_power_selected = charged_power.filter(f => {
                    return turf.booleanPointInPolygon(turf.point([f.lon, f.lat]), selected_area.features[0])
                })

                //集计
                const charged_power_df = new dfd.DataFrame(charged_power_selected)
                const charged_power_agg_data = dfd.toJSON(charged_power_df.loc({ columns: ['weekday', 'hour', 'charged_power'] }).groupby(['weekday', 'hour']).sum().sortValues('hour').sortValues('weekday'))

                const linesdata = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(
                    (name, index) => {
                        const values = charged_power_agg_data.filter(d => d.weekday === index)
                        const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
                            const thisdata = values.filter(h => h.hour === hour)
                            if (thisdata.length > 0) {
                                return thisdata[0].charged_power_sum
                            } else {
                                return 0
                            }
                        })
                        return {
                            data: data,
                            type: 'line',
                            name: name,
                            smooth: true,
                            itemStyle: {
                                color: colors[index]
                            },
                            lineStyle: {
                                color: colors[index]
                            }
                        }
                    }
                )

                //可视化
                setEchartsOption({
                    title: {
                        text: '实际充电需求'
                    },
                    grid: {
                        left: '5%',
                        right: '4%',
                        top: '20%',
                        bottom: '5%',
                        containLabel: true
                    },
                    legend: {
                        top: '10%',
                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                    },
                    xAxis: {
                        name: '小时',
                        type: 'category',
                        nameLocation: 'middle',
                        nameGap: 20,
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                    },
                    yAxis: {
                        name: '充电需求(kwh)',
                        nameLocation: 'middle',
                        nameGap: 50,
                        type: 'value'
                    },
                    series: linesdata
                })

            }
            //数据集计
            if (potential_power.length > 0) {
                let potential_power_selected = []
                //进行区域筛选

                potential_power_selected = potential_power.filter(f => {
                    return turf.booleanPointInPolygon(turf.point([f.lon, f.lat]), selected_area.features[0])
                })

                //集计
                const potential_power_df = new dfd.DataFrame(potential_power_selected)
                const potential_power_agg_data = dfd.toJSON(potential_power_df.loc({ columns: ['weekday', 'hour', 'potential_power'] }).groupby(['weekday', 'hour']).sum().sortValues('hour').sortValues('weekday'))

                const linesdata = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(
                    (name, index) => {
                        const values = potential_power_agg_data.filter(d => d.weekday === index)
                        const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
                            const thisdata = values.filter(h => h.hour === hour)
                            if (thisdata.length > 0) {
                                return thisdata[0].potential_power_sum
                            } else {
                                return 0
                            }
                        }
                        )
                        return {
                            data: data,
                            type: 'line',
                            name: name,
                            smooth: true,
                            itemStyle: {
                                color: colors[index]
                            },
                            lineStyle: {
                                color: colors[index]
                            }
                        }
                    }
                )
                //可视化
                setEchartsOption2({
                    title: {
                        text: '潜在充电需求'
                    },
                    grid: {
                        left: '5%',
                        right: '4%',
                        top: '20%',
                        bottom: '5%',
                        containLabel: true
                    },
                    legend: {

                        top: '10%',
                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                    },
                    xAxis: {
                        name: '小时',
                        type: 'category',
                        nameLocation: 'middle',
                        nameGap: 20,
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                    },
                    yAxis: {
                        name: '充电需求(kwh)',
                        nameLocation: 'middle',
                        nameGap: 50,
                        type: 'value'
                    },
                    series: linesdata
                })
            }
        } else {
            axios.get(`data/charge_linesdata.json`).then(response => {
                const linesdata = response.data
                setEchartsOption({
                    title: {
                        text: '实际充电需求'
                    },
                    grid: {
                        left: '5%',
                        right: '4%',
                        top: '20%',
                        bottom: '5%',
                        containLabel: true
                    },
                    legend: {
                        top: '10%',
                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                    },
                    xAxis: {
                        name: '小时',
                        type: 'category',
                        nameLocation: 'middle',
                        nameGap: 20,
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                    },
                    yAxis: {
                        name: '充电需求(kwh)',
                        nameLocation: 'middle',
                        nameGap: 50,
                        type: 'value'
                    },
                    series: linesdata
                })
            })
            axios.get(`data/potential_linesdata.json`).then(response => {
                const linesdata = response.data
                setEchartsOption2({
                    title: {
                        text: '潜在充电需求'
                    },
                    grid: {
                        left: '5%',
                        right: '4%',
                        top: '20%',
                        bottom: '5%',
                        containLabel: true
                    },
                    legend: {

                        top: '10%',
                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                    },
                    xAxis: {
                        name: '小时',
                        type: 'category',
                        nameLocation: 'middle',
                        nameGap: 20,
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                    },
                    yAxis: {
                        name: '充电需求(kwh)',
                        nameLocation: 'middle',
                        nameGap: 50,
                        type: 'value'
                    },
                    series: linesdata
                })
            })

        }

    }, [selected_area])

    return (
        <>
            <Col span={24}>
                <Card title="区域充电需求时变" extra={<Tooltip title='Click on the bars to show trajectories.'><InfoCircleOutlined /></Tooltip>}
                    bordered={false}>
                    <Collapse defaultActiveKey={['panel1']}>
                        <Panel header="区域负荷曲线" key="panel1">
                            <Button onClick={CreateArea} disabled={!drawMode}>选择区域</Button>
                            <Button onClick={ClearArea} disabled={selected_area.features.length == 0}>清除区域</Button>
                            <ReactECharts
                                option={option}
                                notMerge={true}
                                style={{ height: '250px', width: '100%' }}
                            />
                            <ReactECharts
                                option={option2}
                                notMerge={true}
                                style={{ height: '250px', width: '100%' }}
                            />
                        </Panel>
                    </Collapse>
                </Card>
            </Col>
        </>
    )

}