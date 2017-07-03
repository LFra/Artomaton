/**
 * Created by ludwigfrank on 12/03/2017.
 */
// import socket from '~plugins/socket.io.js'
const INIT_ORIGIN = 'INIT_ORIGIN'

export const state = {
  OFFSET_X: 0,
  OFFSET_Y: 0,
  ORIGIN_LEFT: 460,
  ORIGIN_RIGHT: 1164,
  DISTANCE_MOTORS: 1039.6,
  STEPS_PER_MM: 2000 / (615 - 460),
  MIN_X: 2,
  MAX_X: 2,
  MIN_Y: 2,
  MAX_Y: 2,
  MAX_RPM: 200,
  TIME_SLICE: 2048,
  STEPS_MAX_VALUE: 126,
  STEPS_FIXED_POINTS_VALUE: 32.0,
  STEPS_PER_VALUE: 4,
  MAX_SPEED_MM_S: 70,
  ACCELERATION_S: 0.7,
  ACCELERATION_MM_S2: 70 / 0.7
}

export const mutations = {
  [INIT_ORIGIN] (state, payload) {
    state.OFFSET_X = payload.x
    state.OFFSET_Y = payload.y
  }
}

export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    // console.log(req)
  }
}
