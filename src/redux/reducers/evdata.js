const initState = {
    charged_power: [],
    potential_power: [],
    selected_area: { //空白选区
        type: 'FeatureCollection',
        features: [],
    },
    drawMode: 1,
    heatmap_data: [],
    radiusPixels: 30,
    intensity: 1.5,
    threshold: 0.3,
    activepage: 'Areapowerload'
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
        default:
            return preState;
    }
}