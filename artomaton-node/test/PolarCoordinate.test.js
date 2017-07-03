/* eslint-disable */

const assert = require('assert')
const describe = require('mocha').describe
const resolve = require('path')
const Nuxt = require('nuxt')
import expect from 'expect'
import Coordinate from '../assets/js/Coordinate'
import PolarCoordinate from '../assets/js/PolarCoordinate'
import Driver from '../assets/js/Driver'
import { Firmata as MockFirmata } from 'mock-firmata'
const five = require('johnny-five')
const Board = five.Board
const mockIO = new MockFirmata


const board = new five.Board({
  io: mockIO,
  debug: false,
  repl: false
})
mockIO.emit('connect')
mockIO.emit('ready')

const testSystem = {
  OFFSET_X: 3, // Displace Width
  OFFSET_Y: 4, // Displace Height
  DISTANCE_MOTORS: 6,
  STEPS_PER_MM: 13
}

describe('ToPolar', function() {
  it('Should return 5 for left and right distance', function() {
    const coordinate = new Coordinate(0, 0, testSystem)
    const polar = coordinate.toPolar()
    expect(polar.leftDist).toEqual(5)
    expect(polar.rightDist).toEqual(5)
  })
})

describe('ToCoord', function() {
  it('Should return 0 for x and y', function() {
    const polar = new PolarCoordinate(5, 5, testSystem)
    const coord = polar.toCoordinate()
    expect(coord.x).toEqual(0)
    expect(coord.y).toEqual(0)
  })
})

describe('PolarCoordinate', function() {
  it('Should return generate the correct steps automatically', function() {
    const polar = new PolarCoordinate(5, 5, testSystem)
    expect(polar.leftSteps).toEqual(polar.leftDist * testSystem.STEPS_PER_MM)
    expect(polar.rightSteps).toEqual(polar.rightDist * testSystem.STEPS_PER_MM)
    polar.setLeftDist = 10
    expect(polar.leftSteps).toEqual(polar.leftDist * testSystem.STEPS_PER_MM)
  })
})

describe('AddCoordinate', function() {
  it('Should add two coordinates', function() {
    const c1 = new Coordinate(4, 4, testSystem)
    const c2 = new Coordinate(4, 3, testSystem)
    const c = c1.add(c2)
    expect(c.x).toEqual(8)
    expect(c.y).toEqual(7)
  })
})
