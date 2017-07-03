/**
 * Created by ludwigfrank on 10/03/2017.
 */
import PolarCoordinate from './PolarCoordinate'
import Constants from './Constants'

export default class Coordinate {
  constructor (x, y, system = Constants) {
    this.x = x
    this.y = y
    this.system = system
  }

  /**
   * Set initial stepDelta to drawing area origin.
   * @param {Coordinate} coord
   * @return {PolarCoordinate}
   */
  toPolar () {
    let x = this.x + this.system.OFFSET_X
    let y = this.y + this.system.OFFSET_Y

    if (this.x < 0) {
      console.log(`X Coordinate is to small. x: ${this.x}, xMin: ${0}`)
      x = 0
    }
    if (this.x > this.system.MAX_X) {
      console.log(`X Coordinate is to big. x: ${this.x}, xMax: ${this.system.MAX_X}`)
      x = this.system.MAX_X
    }
    /* if (this.y < system.yMin) {
     console.log(`Y Coordinate is to small. y: ${this.y}, yMin: ${system.yMin}`)
     y = system.yMin
     }
     if (this.y > system.yMax) {
     console.log(`Y Coordinate is to big. y: ${this.y}, yMax: ${system.yMax}`)
     y = system.yMax
     } */
    let leftDist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
    let rightDist = (Math.sqrt(Math.pow(this.system.DISTANCE_MOTORS - x, 2) + Math.pow(y, 2)))
    return new PolarCoordinate(leftDist, rightDist)
  }

  /**
   * Calculates length of vector.
   * @return {Number}
   */
  len () {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Set initial stepDelta to drawing area origin.
   * @param {Coordinate} dest
   * @return {Coordinate}
   */
  minus (dest) {
    this.x -= dest.x
    this.y -= dest.y
    return this
  }

  /**
   * Set initial stepDelta to drawing area origin.
   * @param {Coordinate} dest
   * @return {Coordinate}
   */
  add (dest) {
    this.x += dest.x
    this.y += dest.y
    return this
  }

  /**
   * Set initial stepDelta to drawing area origin.
   * @param {Number} factor
   * @return {Coordinate}
   */
  scale (factor) {
    return new Coordinate(this.x * factor, this.y * factor)
  }

  /**
   * Normalizes the given Vector.
   * @return {Coordinate}
   */
  normalized () {
    let len = this.len()
    return new Coordinate(this.x / len, this.y / len)
  }
}
