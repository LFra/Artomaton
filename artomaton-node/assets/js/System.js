const system = {
  OFFSET_X: 0, // Displace Width
  OFFSET_Y: 0, // Displace Height
  ORIGIN_LEFT: 356,
  ORIGIN_RIGHT: 1214,
  DISTANCE_MOTORS: 1348,
  STEPS_PER_MM: 2000 / (615 - 460),
  RPM_MAX: 200,
  MAX_X: 1000,
  MAX_Y: 1000,
  timeSlice: 2048,
  stepsMaxValue: 126,
  stepsFixedPointFactor: 32.0,
  stepsPerValue: 4,
  speedMax_MM_S: 70,
  acceleration_S: 0.7,
  acceleration_MM_S2: 70 / 0.7,
  PREVIOUS_LEFT: 356,
  PREVIOUS_RIGHT: 1214,
  STEP_DELTA_LEFT: 0,
  STEP_DELTA_RIGHT: 0,
  TESTING: false
}

export default system
