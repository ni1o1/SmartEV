const initState = {
    charged_power: [],
    potential_power: [],
    selected_area: { //空白选区
        type: 'FeatureCollection',
        features: [],
    },

    drawMode: 0
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
        default:
            return preState;
    }
}