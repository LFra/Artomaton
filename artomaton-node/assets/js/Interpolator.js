/**
 * Created by ludwigfrank on 11/03/2017.
 */
// eslint-disable-next-line
import Coordinate from './Coordinate'
// eslint-disable-next-line
import PolarCoordinate from './PolarCoordinate'
import { system } from './System'

export default class Interpolator {
  /**
   * @param {Coordinate} origin
   * @param {Coordinate} destination
   */
  constructor (origin, destination) {
    this.origin = origin
    this.destination = destination
    this.movement = this.destination.minus(origin)
    this.distance = this.movement.len()

    this.time = this.distance / system.speedMax_MM_S
    this.slices = Math.ceil(this.time / (system.timeSlice / 1000000))
  }

  position (slice) {
    let percentage = slice / this.slices
    return this.origin.add(this.movement.scale(percentage))
  }

  generateSlices () {
    let slices = []
    for (let i = 0; i < this.slices; i++) {
      slices.push(this.position(i))
    }
    return slices
  }

  generateSteps () {
    let slicesCart = this.generateSlices()
    let slicesPolar = []
    for (let i = 0; i < slicesCart.length; i++) {
      slicesPolar.push(slicesCart[i].toPolar())
    }
    return slicesPolar
  }

  output () {
    console.log(`Distance: ${this.distance}, Time: ${this.time}, Slices: ${this.slices}`)
  }
}
