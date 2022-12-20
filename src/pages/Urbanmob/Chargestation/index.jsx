import React, { useEffect, useState, useCallback } from 'react'
import ReactECharts from 'echarts-for-react';
import { Button, Col, Card, Collapse, Tooltip, message, Select, Row, Space, Slider, Alert,InputNumber } from 'antd';

import {
    InfoCircleOutlined
} from '@ant-design/icons';

//redux
import { useDispatch, useMappedState } from 'redux-react-hook'
import {
    setchargestations_tmp,
    setselected_area_tmp,
    setvmin_tmp,
    setvmax_tmp,
    setdrawMode_tmp,
    setchargeradius_tmp,
    setstationcoordinates_tmp
} from '@/redux/actions/evdata'
import axios from 'axios';
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
    const { potential_power, charged_power, selected_area, chargestations, vmin, vmax, drawMode, chargeradius, stationcoordinates } = evdata
    //dispatch

    const dispatch = useDispatch()
    const setchargestations = (data) => {
        dispatch(setchargestations_tmp(data))
    }

    const setvmin = (data) => {
        dispatch(setvmin_tmp(data))
    }
    const setvmax = (data) => {
        dispatch(setvmax_tmp(data))
    }
    const setdrawMode = (data) => {
        dispatch(setdrawMode_tmp(data))
    }
    const setselected_area = (data) => {
        dispatch(setselected_area_tmp(data))
    }
    const setchargeradius = (data) => {
        dispatch(setchargeradius_tmp(data))
    }
    useEffect(() => {
        axios.get(`data/chargstations_power.json`).then(response => {
            const val = response.data
            setchargestations(val)
        })
    }, [])
    const [option, setEchartsOption] = useState({})
    const [option2, setEchartsOption2] = useState({})
    //如果选区发生改变
    useEffect(() => {
        //数据集计
        //const colors = ['#cadeea', '#a6bdd7', '#899dc2', '#737fad', '#5b5d8d', '#423b67', '#281e3b']
        if (selected_area.features.length > 0) {
            if (charged_power.length > 0) {
                let charged_power_selected = []
                //进行区域筛选

                charged_power_selected = charged_power.filter(f => {
                    return turf.booleanPointInPolygon(turf.point([f.lon, f.lat]), selected_area.features[0])
                })

                //集计
                const charged_power_df = new dfd.DataFrame(charged_power_selected)
                const charged_power_selected_weekday = new dfd.DataFrame(charged_power_selected.filter(f => f.weekday < 5))
                const charged_power_selected_weekend = new dfd.DataFrame(charged_power_selected.filter(f => f.weekday >= 5))
                const charged_power_agg_weekday = dfd.toJSON(charged_power_selected_weekday.loc({ columns: ['hour', 'charged_power'] }).groupby(['hour']).mean().sortValues('hour').rename({ 'charged_power_mean': 'power' }))
                const charged_power_agg_weekend = dfd.toJSON(charged_power_selected_weekend.loc({ columns: ['hour', 'charged_power'] }).groupby(['hour']).mean().sortValues('hour').rename({ 'charged_power_mean': 'power' }))

                const weekday_data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
                    const thisdata = charged_power_agg_weekday.filter(h => h.hour === hour)
                    if (thisdata.length > 0) {
                        return thisdata[0].power
                    } else {
                        return 0
                    }
                }
                )
                const weekend_data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
                    const thisdata = charged_power_agg_weekend.filter(h => h.hour === hour)
                    if (thisdata.length > 0) {
                        return thisdata[0].power
                    } else {
                        return 0
                    }
                }
                )
                //可视化
                setEchartsOption({
                    title: {
                        text: '潜在充电负荷'
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
                        data: ['周中', '周末']
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
                        nameGap: 25,
                        type: 'value'
                    },
                    series: [{
                        data: weekday_data,
                        type: 'line',
                        name: '周中',
                        smooth: true,
                        itemStyle: {
                            color: '#899dc2'
                        },
                        lineStyle: {
                            color: '#899dc2'
                        }
                    },
                    {
                        data: weekend_data,
                        type: 'line',
                        name: '周末',
                        smooth: true,
                        itemStyle: {
                            color: '#bf8a9d'
                        },
                        lineStyle: {
                            color: '#bf8a9d'
                        }
                    }]
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
                const potential_power_selected_weekday = new dfd.DataFrame(potential_power_selected.filter(f => f.weekday < 5))
                const potential_power_selected_weekend = new dfd.DataFrame(potential_power_selected.filter(f => f.weekday >= 5))
                const potential_power_agg_weekday = dfd.toJSON(potential_power_selected_weekday.loc({ columns: ['hour', 'potential_power'] }).groupby(['hour']).mean().sortValues('hour').rename({ 'potential_power_mean': 'power' }))
                const potential_power_agg_weekend = dfd.toJSON(potential_power_selected_weekend.loc({ columns: ['hour', 'potential_power'] }).groupby(['hour']).mean().sortValues('hour').rename({ 'potential_power_mean': 'power' }))

                const weekday_data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
                    const thisdata = potential_power_agg_weekday.filter(h => h.hour === hour)
                    if (thisdata.length > 0) {
                        return thisdata[0].power
                    } else {
                        return 0
                    }
                }
                )
                const weekend_data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(hour => {
                    const thisdata = potential_power_agg_weekend.filter(h => h.hour === hour)
                    if (thisdata.length > 0) {
                        return thisdata[0].power
                    } else {
                        return 0
                    }
                }
                )
                //可视化
                setEchartsOption2({
                    title: {
                        text: '潜在充电负荷'
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
                        data: ['周中', '周末']
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
                        nameGap: 25,
                        type: 'value'
                    },
                    series: [{
                        data: weekday_data,
                        type: 'line',
                        name: '周中',
                        smooth: true,
                        itemStyle: {
                            color: '#899dc2'
                        },
                        lineStyle: {
                            color: '#899dc2'
                        }
                    },
                    {
                        data: weekend_data,
                        type: 'line',
                        name: '周末',
                        smooth: true,
                        itemStyle: {
                            color: '#bf8a9d'
                        },
                        lineStyle: {
                            color: '#bf8a9d'
                        }
                    }]
                })
            }
        }

    }, [selected_area])

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
    useEffect(() => {
        if (stationcoordinates.length == 2) {
            setselected_area(
                { //空白选区
                    type: 'FeatureCollection',
                    features: [turf.buffer(turf.point(stationcoordinates), chargeradius)],
                }
            )
        }
    }, [JSON.stringify(stationcoordinates), chargeradius])
    return (
        <>
            <Col span={24}>
                <Card title="充电站供需分析" extra={<Tooltip title='Click on the bars to show trajectories.'><InfoCircleOutlined /></Tooltip>}
                    bordered={false}>
                    {selected_area.features.length == 0 ? <>
                        <Row>
                            <Alert
                                message="在地图上选择充电站以展示充电负荷"
                                type="info"
                                showIcon
                            />
                        </Row>
                        <br />
                    </> : null}
                    <Collapse defaultActiveKey={['panel1']}>
                        <Panel header="充电站供需分析" key="panel1">
                            <Space direction='vertical'>
                                <Space>
                                    {/* <Button onClick={CreateArea} disabled={!drawMode}>创建充电站</Button> */}
                                    <Button onClick={ClearArea} disabled={selected_area.features.length == 0}>清除区域</Button>
                                    影响半径：
                                    <Slider
                                        style={{
                                            width: '100px',
                                        }}
                                        min={0.1}
                                        max={5}
                                        onChange={setchargeradius}
                                        value={chargeradius}
                                        step={0.1}
                                    />
                                    {chargeradius}km
                                </Space>
                                <Space direction='vertical'>
                                    充电站总需求量（kwh）
                                    <Space>
                                        {vmin}
                                        <Col style={{ width: '100px', height: '15px', backgroundImage: "linear-gradient(to right,#9DCC42, #FFFE03, #F7941D, #E9420E, #FF0000)" }} />
                                        {vmax}
                                    </Space>
                                </Space>
                            </Space>
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