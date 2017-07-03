/**
 * Created by ludwigfrank on 11/03/2017.
 */
// eslint-disable-next-line
import Coordinate from './Coordinate'
import PolarCoordinate from './PolarCoordinate'
import system from './System'
// import CentralStore from './Store'
// eslint-disable-next-line

const chalk = require('chalk')

export default class Driver {
  constructor (leftStepper, rightStepper) {
    this.LEFT_STEPPER = leftStepper
    this.RIGHT_STEPPER = rightStepper
  }

  init () {
    // this.store.subscribe(this.update.bind(this))
    // 745
    let originPolar = new PolarCoordinate(system.ORIGIN_LEFT, system.ORIGIN_RIGHT)
    let originCart = originPolar.toCoordinate('abs')

    system.OFFSET_X = originCart.x
    system.OFFSET_Y = originCart.y
  }

  static validate (vector) {
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
    if (x < 0 || y < 0 || x > system.MAX_X || y > system.MAX_Y) {
      console.log(`Vector ${vector} position is out of Bounds: ${x} | ${y} `)
      return false
    }
    return true
  }

  /**
   * Calculates the movement for one stepper
   * @param {Object} stepper
   * @param {Object} stepper.extendedDirection
   * @param {Object} stepper.retractDirection
   * @param {String} stepper.name
   * @param {Function} stepper.direction
   * @param {Number} steps
   * @param {Number} rpm
   */
  async move (stepper, steps, rpm) {
    let dir = ''

    if (steps > 0) dir = stepper.extendedDirection
    else dir = stepper.retractDirection

    return new Promise( resolve => {
      if (steps === 0) {
        resolve()
        if (process.env.LOGGING) console.log(chalk.gray(`Done stepping ${stepper.name}, ${steps}`))
      } else {
        if(system.TESTING) {
          setTimeout(function () {
            // console.log(chalk.gray(`Done stepping ${stepper.name}, ${steps}`))
            resolve({stepper, steps})
          }, 100)
        } else {
          stepper.direction(dir).rpm(rpm).step(Math.abs(steps), function () {
            resolve({stepper, steps})
            // console.log(chalk.gray(`Done stepping ${stepper.name}, ${steps}`))
          })
        }
      }
    })
  }

  async draw (stepsLeft, stepsRight) {
    console.log(chalk.bgYellow.gray(` ${stepsLeft} | ${stepsRight} `))
    let left = Math.abs(stepsLeft)
    let right = Math.abs(stepsRight)
    try {
      await Promise.all([
        this.move(this.LEFT_STEPPER, stepsLeft, left >= right ? system.RPM_MAX : system.RPM_MAX * Math.abs(stepsLeft / stepsRight)),
        this.move(this.RIGHT_STEPPER, stepsRight, right >= left ? system.RPM_MAX : system.RPM_MAX * Math.abs(stepsRight / stepsLeft))
      ]).then((c) => {
        if (process.env.LOGGING) console.log(chalk.gray(`Done stepping both!`))
      })
    } catch (err) {
      console.log(err)
    }
  }
}
