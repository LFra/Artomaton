/**
 * Created by ludwigfrank on 17/03/2017.
 */
import Coordinate from './Coordinate'
import PolarCoordinate from './PolarCoordinate'
import constants from './Constants'

export default class Validator {
  static vector (vector) {
    let x, y = -1
    if (vector instanceof Coordinate) [x, y] = [vector.x, vector.y]
    else if (vector instanceof PolarCoordinate) {
      if (vector.leftDist < 0 || vector.rightDist < 0) {
        console.log(`String length can't be negative: ${vector.leftDist}mm | ${vector.rightDist}mm`)
      }
      let coord = vector.toCoordinate()
      x = coord.x
      y = coord.y
    } else {
      console.log(`${vector} is not a Vector! Skipping.`)
      return false
    }
    if (x < 0 || y < 0 || x > constants.MAX_X || y > constants.MAX_Y) {
      console.log(`Vector ${vector} position is out of Bounds: ${x} | ${y} `)
      return false
    }
    return true
  }
}
