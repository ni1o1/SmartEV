/* global window */
import React, { useState, useEffect, useCallback } from 'react';
import { _MapContext as MapContext, StaticMap, NavigationControl, ScaleControl, FlyToInterpolator } from 'react-map-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DeckGL from '@deck.gl/react';
import { useSubscribe, usePublish, useUnsubscribe } from '@/utils/usePubSub';
import { useInterval } from 'ahooks';
import { AmbientLight, LightingEffect, MapView, FirstPersonView, _SunLight as SunLight } from '@deck.gl/core';
import { IconLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
//redux
import { useDispatch, useMappedState } from 'redux-react-hook'
//镜头redux
import {
  setviewStates_tmp
} from '@/redux/actions/Visualcamera'
import { GeoJsonLayer } from '@deck.gl/layers';

import { scaleLinear } from 'd3-scale';
import { EditableGeoJsonLayer, DrawPolygonMode, DrawPointMode, ViewMode } from 'nebula.gl';
import {
  setselected_area_tmp,
  setdrawMode_tmp,
  setstationcoordinates_tmp
} from '@/redux/actions/evdata'
import * as turf from '@turf/turf'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibmkxbzEiLCJhIjoiY2t3ZDgzMmR5NDF4czJ1cm84Z3NqOGt3OSJ9.yOYP6pxDzXzhbHfyk3uORg';


export default function Deckmap() {
  const unsubscribe = useUnsubscribe();//清除更新组件重复订阅的副作用
  /*
    ---------------redux中取出变量---------------
  */
  //#region
  const mapState = useCallback(
    state => ({
      evdata: state.evdata,
      Visualcamera: state.Visualcamera
    }),
    []
  );
  const { Visualcamera, evdata } = useMappedState(mapState);
  const { selected_area, drawMode, heatmap_data,
    radiusPixels,
    intensity,
    threshold, activepage,
    chargestations, vmin, vmax, chargeradius, stationcoordinates, drawMode_station
  } = evdata
  //dispatch
  const dispatch = useDispatch()

  //#endregion
  /*
  ---------------镜头设置与截图功能---------------
  */
  //#region
  const { fpvsize, viewStates } = Visualcamera
  const setViewStates = (data) => {
    dispatch(setviewStates_tmp(data))
  }

  //#endregion
  /*
  ---------------地图底图设置---------------
  */
  //#region
  //管理光强度
  const [lightintensity, setlightintensity] = useState(2)
  unsubscribe('lightintensity')
  useSubscribe('lightintensity', function (msg: any, data: any) {
    setlightintensity(data)
  });

  //管理光角度X
  const [lightx, setlightx] = useState(1554937300)
  unsubscribe('lightx')
  useSubscribe('lightx', function (msg: any, data: any) {
    setlightx(data)
  });

  //地图光效
  const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0
  });


  const sunLight = new SunLight({
    timestamp: lightx,
    color: [255, 255, 255],
    intensity: lightintensity
  });
  const lightingEffect = new LightingEffect({ ambientLight, sunLight });

  const material = {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 22,
    specularColor: [60, 64, 70]
  };

  const theme = {
    buildingColor: [255, 255, 255],
    trailColor0: [253, 128, 93],
    trailColor1: [23, 184, 190],
    material,
    effects: [lightingEffect]
  };



  //默认地图底图
  const [mapStyle, setMapStyle] = React.useState('dark-v9');
  const publish = usePublish();

  //订阅地图样式
  unsubscribe('mapstyle')
  useSubscribe('mapstyle', function (msg: any, data: any) {
    setMapStyle(data)
  });


  useEffect(() => {
    //允许右键旋转视角
    document.getElementById("deckgl-wrapper").addEventListener("contextmenu", evt => evt.preventDefault());
    //转换至用户自定义中心点
    setViewStates({
      firstPerson: viewStates.firstPerson,
      baseMap: {
        ...viewStates.baseMap,
        longitude: 121.23,
        latitude: 31.18,
        zoom: 10,
        pitch: 0
      }
    })
  }, [])

  //第一人称底图
  const minimapBackgroundStyle = {
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    height: '100%',
    background: '#aaa',
    boxShadow: '0 0 8px 2px rgba(0,0,0,0.15)'
  };
  //#endregion
  /*
  ---------------地图旋转按钮---------------
  */
  //#region
  //旋转的函数
  function rotate(pitch, bearing, duration) {
    setViewStates({
      firstPerson: viewStates.firstPerson
      ,
      baseMap: {
        ...viewStates.baseMap,
        pitch: pitch,
        bearing: bearing,
        transitionDuration: duration,
        transitionInterpolator: new FlyToInterpolator()
      }
    })
  }
  const [angle, setangle] = useState(120);
  const [interval, setInterval] = useState(undefined);
  useInterval(() => {
    rotate(viewStates.baseMap.pitch, angle, 2000)
    setangle(angle => angle + 10)
  }, interval, { immediate: true });
  //旋转的按钮
  function rotatecam() {

    setangle(viewStates.baseMap.bearing + 10)
    if (interval != 2000) {
      setInterval(2000)
    } else {
      setInterval(undefined)
      setViewStates(viewStates)
    }

  };
  //镜头旋转工具
  const [fristperson_isshow, setfristperson_isshow] = useState(false)
  const cameraTools = (
    <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
      <button
        title="Rotatecam"
        onClick={rotatecam}
        style={{ opacity: interval == 2000 ? 1 : 0.2 }}
      > <span className="iconfont icon-camrotate" /></button>
      <button
        title="fristpersoncontrol"
        onClick={() => {
          setfristperson_isshow(!fristperson_isshow)
        }}
        style={{ opacity: fristperson_isshow ? 1 : 0.2 }}
      >
        <span className="iconfont icon-firstperson" /></button>
    </div>
  );
  //#endregion
  /*
  ---------------区域编辑---------------
  */
  //#region
  const selectedFeatureIndexes = [];
  const setselected_area = (data) => {
    dispatch(setselected_area_tmp(data))
  }
  const setdrawMode = (data) => {
    dispatch(setdrawMode_tmp(data))
  }
  function handleonedit_area({ updatedData, editType }) {
    if (editType == 'addFeature') {
      setdrawMode(1)
      updatedData.features = [updatedData.features[updatedData.features.length - 1]]
      setselected_area(
        updatedData
      )
    }
  }
  //#endregion
  /*
  ---------------Tooltip设置---------------
  */
  //#region
  function getTooltip(info) {
    if (info.layer) {
      if (info.layer.id == "chargestation-layer") {
        const { object } = info
        return object && `\
        站点ID：${object.properties.stationId}
        电量需求：${object.properties.charged_power.toFixed()}kwh
        `
      }
    }

  }
  //#endregion
  /*
  ---------------充电站colormap设置---------------
  */
  //#region


  //colormap的设置
  const cmap = (v, vminval, vmaxval) => {
    const COLOR_SCALE = scaleLinear()
      .domain([0, 0.25, 0.5, 0.75, 1])
      .range(['#9DCC42', '#FFFE03', '#F7941D', '#E9420E', '#FF0000']);
    //norm
    const WIDTH_SCALE = scaleLinear()
      .clamp(true)
      .domain([vminval, vmaxval])
      .range([0, 1]);
    try {
      return COLOR_SCALE(WIDTH_SCALE(v)).match(/\d+/g).map(f => parseInt(f))
    } catch { return null }
  }

  const setstationcoordinates = (data) => {
    dispatch(setstationcoordinates_tmp(data))
  }
  const showChargestationinfo = (info) => {
    const { object } = info
    setstationcoordinates(object.geometry.coordinates
    )
  }
  const handleonedit_station = (e) => {

    if (e.editType == "addFeature") {
      setstationcoordinates(e.updatedData.features[0].geometry.coordinates)
    }
  }

  //#endregion
  /*
  ---------------地图图层设置---------------
  */
  //#region
  const layers = [
    fristperson_isshow ? new IconLayer({//第一人称位置
      id: 'ref-point',
      data: [{
        color: [68, 142, 247],
        coords: [viewStates.baseMap.longitude, viewStates.baseMap.latitude, viewStates.firstPerson.position[2]]
      }],
      iconAtlas: 'images/firstperson.png',
      iconMapping: {
        marker: { x: 0, y: 0, width: 200, height: 200, mask: true }
      },
      sizeScale: 5,
      getIcon: d => 'marker',
      getPosition: d => [...d.coords, 0],
      getSize: d => 10,
      getColor: d => d.color
    }) : null,
    new EditableGeoJsonLayer({//选择区域
      id: 'Edit-geojson-layer',
      data: selected_area,
      mode: drawMode == 1 ? ViewMode : DrawPolygonMode,
      selectedFeatureIndexes,
      onEdit: handleonedit_area,
      opacity: 0.5,
      getFillColor: [68, 142, 247],
      getLineColor: [68, 142, 247]
    }),
    activepage == 'Chargeheatmap' ? new HeatmapLayer({
      data: heatmap_data,
      id: 'heatmp-layer',
      pickable: false,
      getPosition: d => [d.lon, d.lat],
      getWeight: d => {
        return d.power
      },
      radiusPixels,
      intensity,
      threshold
    }) : null,
    activepage == 'Chargestation' && new GeoJsonLayer({
      id: 'chargestation-layer',
      data: chargestations,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      pointType: 'circle',
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: d => cmap(d.properties.charged_power, vmin, vmax),
      getPointRadius: d => Math.max(d.properties.charged_power / 10, 100),
      getLineWidth: 1,
      getElevation: 30,
      onClick: showChargestationinfo,
    }),
    activepage == 'Chargestation' && new EditableGeoJsonLayer({//选择充电站
      id: 'Edit-chargestation-layer',
      data: { //空白选区
        type: 'FeatureCollection',
        features: [],
      },
      mode: drawMode_station == 1 ? ViewMode : DrawPointMode,
      selectedFeatureIndexes,
      onEdit: handleonedit_station,
      opacity: 0.5,
      getFillColor: [68, 142, 247],
      getLineColor: [68, 142, 247]
    }),
  ]
  //#endregion
  /*
  ---------------渲染地图---------------
  */
  //#region
  const onViewStateChange = useCallback(({ viewId, viewState }) => {
    if (viewId === 'baseMap') {
      setViewStates({
        baseMap: viewState,
        firstPerson: {
          ...viewStates.firstPerson,
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          bearing: viewState.bearing,
          zoom: viewState.zoom,
        }
      });
    } else {
      setViewStates({
        baseMap: {
          ...viewStates.baseMap,
          zoom: viewStates.baseMap.zoom,
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          bearing: viewState.bearing,
        },
        firstPerson: { ...viewState, fovy: 75 }
      });
    }
  }, [viewStates]);
  return (
    <DeckGL
      layers={layers}
      viewState={viewStates}
      effects={theme.effects}
      controller={{ doubleClickZoom: false, inertia: true, touchRotate: true }}
      style={{ zIndex: 0 }}
      ContextProvider={MapContext.Provider}
      onViewStateChange={onViewStateChange}
      getTooltip={getTooltip}
    >
      <MapView id="baseMap"
        controller={true}
        y="0%"
        height="100%"
        position={
          [0, 0, 0]}>
        <StaticMap reuseMaps
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={`mapbox://styles/mapbox/${mapStyle}`}
          preventStyleDiffing={true} >
          <div className='mapboxgl-ctrl-bottom-left' style={{ bottom: '20px' }}>
            <ScaleControl maxWidth={100} unit="metric" />
          </div>
        </StaticMap>
        <div className='mapboxgl-ctrl-bottom-right' style={{ bottom: '80px' }}>
          <NavigationControl onViewportChange={viewport => {

            setViewStates({
              baseMap: {
                ...viewStates.baseMap,
                longitude: viewport.longitude,
                latitude: viewport.latitude,
                bearing: viewport.bearing,
                zoom: viewport.zoom
              },
              firstPerson: viewStates.firstPerson
            })
          }} />
          {cameraTools}
        </div>
      </MapView>
      {fristperson_isshow && (<FirstPersonView id="firstPerson"
        controller={{ scrollZoom: false, dragRotate: true, inertia: true }}
        far={10000}
        focalDistance={1.5}
        x={(100 - fpvsize.width) + '%'}
        y={0}
        width={fpvsize.width + '%'}
        height={fpvsize.height + '%'}
        clear={true}>
        <div style={minimapBackgroundStyle} /> </FirstPersonView>)}
    </DeckGL>
  );
}
//#endregion