<template>
  <section class="container">
    <previewCanvas :queue="coordinateQueueHistory"></previewCanvas>
    <div class="inputs">
      <div class="inputs-content">
        <input v-model.number="x" placeholder="X-Value">
        <input v-model.number="y" placeholder="Y-Value">
      </div>
      <div class="inputs-content">
        <input v-model.number="stepsLeft" placeholder="stepsLeft">
        <input v-model.number="stepsRight" placeholder="stepsRight">
      </div>
    </div>
    <div class="coordinates">
      <div class="coord">
        <p> Coordinate </p>
        <p>x: {{ x }}</p>
        <p>y: {{ y }}</p>
      </div>
      <div class="coord">
        <p> Polar Coordinate </p>
        <p> left: {{ Math.round(polar.leftDist) }}</p>
        <p> right: {{ Math.round(polar.rightDist) }} </p>
      </div>
    </div>
    <div class="line">
      <button @click="line"> Line </button>
    </div>
    <div class="line">
      <button @click="drawNextChunk"> drawNextChunk </button>
    </div>
    <div class="line">
      <button @click="sendStepData"> send </button>
    </div>
    <div class="processing">
      <button @click="getDataFromProcessing"> processing </button>
    </div>
    <div class="processing">
      <button @click="servo('up')"> Servo Up </button>
    </div>
    <div class="processing">
      <button @click="servo('down')"> Servo Down </button>
    </div>

    <div class="processing">
      <button @click="canvasToData"> Canvas to data </button>
    </div>
  </section>
</template>

<script>
  // eslint
  import socket from '~plugins/socket.io.js'
  import Coordinate from '../assets/js/Coordinate'
  // eslint-disable-next-line
  import PolarCoordinate from '../assets/js/PolarCoordinate'
  // import Interpolator from '../assets/js/Interpolator'
  import Validator from '../assets/js/Validator'
  import constants from '../assets/js/Constants'
  import coords from '../assets/js/MockData'
  import PreviewCanvas from '../components/PreviewCanvas.vue'

  export default {
    components: {
      PreviewCanvas
    },
    data () {
      return {
        x: 0,
        y: 0,
        cartesianCoords: { x: 0, y: 0 },
        polarCoords: { left: constants.ORIGIN_LEFT, right: constants.ORIGIN_RIGHT },
        stepDelta: { left: 0, right: 0 },
        leftDist: constants.ORIGIN_LEFT,
        rightDist: constants.ORIGIN_RIGHT,
        // Saves the cart coordinates. Each array represents a line and contains an array of [x,y] values.
        // After each drawn line the pen is lifted.
        coordinateQueue: coords,
        coordinateQueueHistory: [],
        stepQueue: [],
        stepsLeft: 0,
        stepsRight: 0,
        finishedWithChunk: true,
        // delta to remove the angle at which the image is false drawn
        delta: 0,
        deltaIncrease: 1
      }
    },
    computed: {
      coord () {
        return new Coordinate(this.cartesianCoords.x, this.cartesianCoords.y)
      },
      polar () {
        return new PolarCoordinate(this.polarCoords.left, this.polarCoords.right)
      }
    },
    created () {
      const origin = this.polar.toCoordinate()
      constants.OFFSET_X = origin.x
      constants.OFFSET_Y = origin.y
      this.stepDelta = { left: this.polar.leftSteps, right: this.polar.rightSteps }
    },
    mounted () {
      const self = this
      socket.on('CLIENT', (payload) => {
        console.log('New data')
        self.coordinateQueue.push(payload)
        console.log(self.coordinateQueue)
      })
      socket.on('getDataFromProcessing', (payload) => {
        console.log('client works fine')
      })
      socket.on('DRAW_NEXT_CHUNK', () => {
        console.log('new junk')
        this.drawNextChunk()
      })
      socket.on('NEW_LINE_DATA_FROM_PROCESSING_TO_CLIENT', payload => {
        console.log(payload.line)
        this.coordinateQueue.push(payload.line)
        this.drawNextChunk()
        this.delta += this.deltaIncrease
      })
    },
    methods: {
      servo (dir) {
        if (dir === 'up') socket.emit('SERVO_UP')
        else socket.emit('SERVO_DOWN')
      },
      canvasToData () {
        console.log('new data')
        socket.emit('CANVAS_TO_LINE_DATA')
      },
      drawNextChunk () {
        if (this.coordinateQueue.length === 0) {
          console.log('Coordinate Queue is empty!')
          return
        }
        let chunk = this.coordinateQueue.shift()
        this.coordinateQueueHistory.push(chunk)
        console.log(chunk)
        chunk.forEach((coordinate) => {
          this.generateSteps(coordinate)
        })
        this.sendStepData()
      },
      getDataFromProcessing () {
        console.log('getting data')
        socket.emit('DATA_FROM_PROCESSING', true)
      },
      /**
       * Generates steps from the given cartesian coordinate. Pushes them on the Queue of pending step data.
       * @param {Coordinate} coordinate
       */
      generateSteps (coordinate) {
        const cartesianCoordinate = new Coordinate(coordinate[0] + this.delta, coordinate[1])
        if (cartesianCoordinate instanceof Coordinate === false) throw new Error(`${Coordinate} is not a Polar Coordinate!`)
        Validator.vector(cartesianCoordinate)
        // console.log(cartesianCoordinate)
        const polarCoordinate = cartesianCoordinate.toPolar()
        // console.log(polarCoordinate)
        const stepsLeft = polarCoordinate.leftSteps - this.stepDelta.left
        const stepsRight = polarCoordinate.rightSteps - this.stepDelta.right

        this.stepQueue.push([stepsLeft, stepsRight])

        this.stepDelta.left += stepsLeft
        this.stepDelta.right += stepsRight
      },
      line () {
        socket.emit('LINE', { x: this.coord.x, y: this.coord.y }, function (response) {
        })
      },
      sendStepData () {
        socket.emit('STEP_DATA', { stepData: this.stepQueue })
        this.stepQueue = []
      }
    },
    head () {
      return {
        title: 'Polar'
      }
    }
  }
</script>

<style scoped>

 .coordinates{
   display: flex;
   align-content: center;
   justify-content: center;
   width: 100%;
 }
 .inputs{
   width: 100%;
   display: flex;
   align-content: center;
   justify-content: center;
   padding-top: 120px;
 }
 .update{
   width: 100%;
   display: flex;
   align-content: center;
   justify-content:center;
 }
 .inputs-content{
   height: 40px;
   align-self: center;
 }

 .container{
   max-width: 980px;
   padding-left: 12px;
   padding-right: 12px;
   margin: 0 auto;
   display: flex;
   flex-flow: row wrap;
 }

 .coord{
   padding: 40px;
 }
</style>
