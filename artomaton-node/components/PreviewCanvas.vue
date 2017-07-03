<template>
    <section class="PreviewCanvas">
      <div id="sketchContainer"></div>
    </section>
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    computed: {
    },
    props: {
      queue: {
        required: true
      }
    },
    created () {
    },
    mounted () {
      const P5 = require('p5')

      const sketch = (p) => {
        p.setup = () => {
          p.createCanvas(800, 800)
          p.background(244)
        }
        p.draw = () => {
          this.queue.forEach(function (line) {
            p.noFill()
            p.beginShape()
            line.forEach(function (line) {
              p.vertex(line[0], line[1])
            })
            p.endShape()
          })
          // p.line(4, 4, 500, 500)
        }
      }

      let Five = new P5(sketch, document.getElementById('sketchContainer'))
      console.log(Five)
    },
    methods: {}
  }
</script>

<style scoped>

</style>
