const initState = {
    viewStates: {
        baseMap: {
            longitude: 139.691,
            latitude: 35.6011,
            zoom: 11,
            pitch: 50,
            bearing: 0
        },
        firstPerson: {
            longitude: 139.691,
            latitude: 35.6011,
            zoom: 11,
            pitch: 0,
            bearing: 0,
            position: [0, 0, 2],
            fovy: 75
        }
    },
    fpvsize: {
        width: 29,
        height: 50
    }
}
export default function VisualcameraReducer(preState = initState, action) {
    const { type, data } = action
    switch (type) {
        case 'setviewStates':
            return {...preState, viewStates: data }
        case 'setfpvsize':
            return {...preState, fpvsize: data }
        default:
            return preState;
    }
}