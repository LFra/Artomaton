/* eslint-disable */
const Nuxt = require('nuxt')
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const isProd = process.env.NODE_ENV === 'production'
import { Firmata as MockFirmata } from 'mock-firmata'
const five = require('johnny-five')
const Board = five.Board
const Accelerometer = five.Accelerometer
const chalk = require('chalk')

import Driver from './assets/js/Driver'
import system from './assets/js/System.js'
import each from 'async/each'
const testing = true
const log = console.log
const mockIO = new MockFirmata
let board = ''

if (system.TESTING) {
  mockIO.emit('connect')
  mockIO.emit('ready')
  board = new Board({
    io: mockIO,
    debug: false,
    repl: false
  })
} else {
  board = new Board()
}


console.log(system)
// Import and Set Nuxt.js options
let config = require('./nuxt.config.js')
config.dev = !isProd

// Init Nuxt.js
const nuxt = new Nuxt(config)
app.use(nuxt.render)

app.post('/', function (req, res) {
  res.send('POST request to the homepage')
})

// Build only in dev mode
if (config.dev) {
  nuxt.build()
  .catch((error) => {
    console.error(error) // eslint-disable-line no-console
    process.exit(1)
  })
}

// Listen the server
server.listen(port, '0.0.0.0')
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console

board.on('ready', function () {
  log(chalk.black.bgRed.bold(`BOARD READY.`))

  let stepQueue = []
  let stepQueueLength = 0

  const stepperLeft = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 11,
      dir: 13
    },
    rpm: system.RPM_MAX,
  })
  stepperLeft.extendedDirection = five.Stepper.DIRECTION.CW
  stepperLeft.retractDirection = five.Stepper.DIRECTION.CCW
  stepperLeft.name = 'left'

  const stepperRight = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: {
      step: 3,
      dir: 4
    },
    rpm: system.RPM_MAX,
  })
  stepperRight.extendedDirection = five.Stepper.DIRECTION.CCW
  stepperRight.retractDirection = five.Stepper.DIRECTION.CW
  stepperRight.name = 'right'

  const servo = new five.Servo(8)

  function movePen () {
    pen('up').then(() => {
      const d = stepQueue.shift()
      driver.draw(d[0], d[1]).then( () => {
        pen('down').then(drawSteps())
      })
    })
  }

  function pen(dir) {
    let angle = dir === 'up' ? 80 : 120
    const time = 500
    servo.to(angle)
    return new Promise(resolve => {
      setTimeout(() => { resolve() }, time)
    })
  }

  const driver = new Driver(stepperLeft, stepperRight)
  driver.init()
  let s = null

  function drawSteps() {
    return new Promise(resolve => {
      const d = stepQueue.shift()
      driver.draw(d[0], d[1]).then( () => {
          if (stepQueue.length > 0) {
            drawSteps()
            resolve()
          } else {
            s.emit('DRAW_NEXT_CHUNK')
            log(chalk.gray.bgBlue.bold(``))
            log(chalk.gray.bgCyan.bold(` STEP QUEUE EMPTY `))
            log(chalk.gray.bgBlue.bold(``))
            s.broadcast.emit('getNewLineDataFromProcessing')
            driver.draw(0, 0)
            pen('up').then(resolve())
          }
        }
      )
    })
  }

  io.on('connection', function (socket) {
    console.log('connected')
    s = socket
    s.on('NEW_COORDINATE_ARRAY', function (payload) {
      console.log('Got from Processing')
      s.emit('CLIENT', payload)
    })
    socket.on('STEP_DATA', function (payload) {
      stepQueue = stepQueue.concat(payload.stepData)
      stepQueueLength += payload.stepData.length
      log(chalk.gray.bgBlue.bold(``))
      log(chalk.gray.bgBlue.bold(` NEW STEP DATA ${payload.stepData.length} `))
      log(chalk.gray.bgBlue.bold(``))
      movePen()
    })
    socket.on('SERVO_UP', function () {
      pen('up').then(console.log('Pen is up'))
    })
    socket.on('SERVO_DOWN', function () {
      pen('down').then(console.log('Pen is down'))
    })
    socket.on('KINECET_CONNECTED', function (payload) {
      console.log(payload)
    })
    socket.on('NEW_LINE_DATA_FROM_PROCESSING', function (payload) {
      console.log('Getting new data')
      socket.broadcast.emit('NEW_LINE_DATA_FROM_PROCESSING_TO_CLIENT', payload)
    })
    socket.on('DATA_FROM_PROCESSING', function  (payload) {
      console.log('trying to getting new data', payload)
      socket.broadcast.emit('getNewLineDataFromProcessing')
    })
    socket.on('CANVAS_TO_LINE_DATA', function () {
      socket.broadcast.emit('canvasToLineData')
    })
  })
})


