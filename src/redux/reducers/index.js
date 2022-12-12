//汇总reducer
import { combineReducers } from 'redux'
import evdata from './evdata'
import Visualcamera from './Visualcamera'
export default combineReducers({
    evdata,
    Visualcamera
})