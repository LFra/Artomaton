/**
 * Created by ludwigfrank on 10/03/2017.
 */
import Constants from './Constants'
import Coordinate from './Coordinate'

export default class PolarCoordinate {
  constructor (leftDist, rightDist, system = Constants) {
    this.leftDist = leftDist
    this.rightDist = rightDist
    this.leftSteps = this.leftDist * system.STEPS_PER_MM
    this.rightSteps = this.rightDist * system.STEPS_PER_MM
    this.type = 'POLAR_COORDINATE'
    this.system = system
  }

  init () {
    this.leftSteps = this.leftDist * this.system.STEPS_PER_MM
    this.rightSteps = this.rightDist * this.system.STEPS_PER_MM
  }
  /**
   * Adds two Polar Coordinates.
   * @param {PolarCoordinate} dest
   * @return {PolarCoordinate}
   */
  add (dest) {
    return new PolarCoordinate(this.leftDist + dest.leftDist, this.rightDist + dest.rightDist)
  }

  /**
   * Subtracts two Polar Coordinates.
   * @param {PolarCoordinate} dest
   * @return {PolarCoordinate}
   */
  subtract (dest) {
    return new PolarCoordinate(this.leftDist - dest.leftDist, this.rightDist - dest.rightDist)
  }

  /**
   * Set initial stepDelta to drawing area origin.
   * @param {String} type
   * @return {Coordinate}
   */
  toCoordinate (type = 'rel') {
    let x = (Math.pow(this.leftDist, 2) - Math.pow(this.rightDist, 2) + Math.pow(this.system.DISTANCE_MOTORS, 2)) / (2 * this.system.DISTANCE_MOTORS)
    let y = Math.sqrt(Math.abs(Math.pow(this.leftDist, 2) - Math.pow(x, 2)))

    if (type === 'rel') {
      x -= this.system.OFFSET_X
      y -= this.system.OFFSET_Y
    }

    return new Coordinate(x, y)
  }

  getStepData () {
    return {
      left: this.leftSteps,
      right: this.rightSteps
    }
  }
}
