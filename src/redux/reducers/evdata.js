const initState = {
    charged_power: [],
    potential_power: [],
    selected_area: { //空白选区
        type: 'FeatureCollection',
        features: [],
    },
    drawMode: 1,
    drawMode_station: 0,
    heatmap_data: [],
    radiusPixels: 30,
    intensity: 1.5,
    threshold: 0.3,
    activepage: 'Areapowerload',
    chargestations: { //空白选区
        type: 'FeatureCollection',
        features: [],
    },
    vmin: 0,
    vmax: 500,
    chargeradius: 0.5,
    stationcoordinates: []
}
export default function trajReducer(preState = initState, action) {
    const { type, data } = action
    switch (type) {
        case 'setcharged_power':
            return {...preState, charged_power: data }
        case 'setselected_area':
            return {...preState, selected_area: data }
        case 'setdrawMode':
            return {...preState, drawMode: data }
        case 'setpotential_power':
            return {...preState, potential_power: data }
        case 'setheatmap_data':
            return {...preState, heatmap_data: data }
        case 'setradiusPixels':
            return {...preState, radiusPixels: data }
        case 'setintensity':
            return {...preState, intensity: data }
        case 'setthreshold':
            return {...preState, threshold: data }
        case 'setactivepage':
            return {...preState, activepage: data }
        case 'setchargestations':
            return {...preState, chargestations: data }
        case 'setvmin':
            return {...preState, vmin: data }
        case 'setvmax':
            return {...preState, vmax: data }
        case 'setchargeradius':
            return {...preState, chargeradius: data }
        case 'setstationcoordinates':
            return {...preState, stationcoordinates: data }
        case 'setdrawMode_station':
            return {...preState, drawMode_station: data }
        default:
            return preState;
    }
}