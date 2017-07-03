/**
 * Created by ludwigfrank on 16/03/2017.
 */
const initialState = {
  OFFSET_X: 0, // Displace Width
  OFFSET_Y: 0, // Displace Height
  ORIGIN_LEFT: 356,
  ORIGIN_RIGHT: 1214,
  DISTANCE_MOTORS: 1348,
  STEPS_PER_MM: 2000 / (615 - 460),
  RPM_MAX: 200,
  MAX_X: 1000,
  MAX_Y: 1000,
  PREVIOUS_LEFT: 356,
  PREVIOUS_RIGHT: 1214,
  STEP_DELTA_LEFT: 0,
  STEP_DELTA_RIGHT: 0
}

const state = (state = initialState, action) => {
  console.log('system', action)
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}


//actions
const increment = () => {
  return {
    type: 'INCREMENT'
  }
}

export default state
