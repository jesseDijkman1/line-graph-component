import {
  scaler,
  normalizer,
  getPathData,
  createVector,
  getRandomNumbers,
  getSvgDimensions,
  createPath,
  difference,
  plus,
  times,
} from "./utils"

class Graph {
  static defaultOptions() {
    return {
      padding: [0, 0, 0, 0],
      stroke: "black",
      fill: "black",
    }
  }

  constructor(svg, _options) {
    this.svg = svg
    this.options = { ...Graph.defaultOptions(), ..._options }

    this.currentVectors = null

    this.path = null
    this.width = 0
    this.height = 0
    this.scaleX = 0
    this.scaleY = 0

    this.paddingTop =
      typeof this.options.padding[0] != "number" ? 0 : this.options.padding[0]
    this.paddingRight =
      typeof this.options.padding[1] != "number"
        ? this.paddingTop
        : this.options.padding[1]
    this.paddingBottom =
      typeof this.options.padding[2] != "number"
        ? this.paddingTop
        : this.options.padding[2]
    this.paddingLeft =
      typeof this.options.padding[3] != "number"
        ? this.paddingRight
        : this.options.padding[3]

    this.stroke = this.options.stroke
    this.fill = this.options.fill

    this.init()
  }

  init() {
    this.setSize()
    this.setScale()
  }

  createPath(pathData) {
    this.path = createPath({
      d: pathData,
      stroke: this.stroke,
      fill: this.fill,
    })

    this.svg.appendChild(this.path)
  }

  updatePath(pathData) {
    this.path.setAttribute("d", pathData)
  }

  setSize() {
    // Set the dimensions of the graph minus the padding
    const { width, height } = getSvgDimensions(this.svg)

    this.width = width - (this.paddingLeft + this.paddingRight)
    this.height = height - (this.paddingTop + this.paddingBottom)
  }

  setScale() {
    this.scaleX = scaler(0, this.width)
    this.scaleY = scaler(0, this.height)
  }

  scale(normalizedVectors) {
    return normalizedVectors.map(({ x, y }) => ({
      x: this.scaleX(x) + this.paddingLeft,
      y: this.scaleY(y) + this.paddingTop,
    }))
  }

  normalize(vectorsArray) {
    const { xValues, yValues } = this.splitVectors(vectorsArray)

    const normalizeX = normalizer(Math.min(...xValues), Math.max(...xValues))
    const normalizeY = normalizer(Math.min(...yValues), Math.max(...yValues))

    return vectorsArray.map(({ x, y }) => ({
      x: normalizeX(x),
      y: normalizeY(y),
    }))
  }

  splitVectors(vectorsArray) {
    return {
      xValues: vectorsArray.map(({ x }) => x),
      yValues: vectorsArray.map(({ y }) => y),
    }
  }

  transformVectors(vectorsArray) {
    const normalizedVectors = this.normalize(vectorsArray)
    return [
      {
        x: 0 + this.paddingLeft,
        y: this.height + this.paddingTop,
      },
      ...this.scale(normalizedVectors),
      {
        x: this.width + this.paddingLeft,
        y: this.height + this.paddingTop,
      },
    ]
  }

  transition(vectorsArray, _steps = 60) {
    if (!this.currentVectors) return

    let steps = 0

    const oldVectors = this.currentVectors
    const newVectors = this.transformVectors(vectorsArray)

    const differentialVectors = newVectors.map((vector, index) => {
      const { x, y } = difference(vector, oldVectors[index])

      return { x: x / _steps, y: y / _steps }
    })

    function frames(...args) {
      if (steps >= _steps) return

      steps += 1

      requestAnimationFrame(frames.bind(this))

      const transitionVectors = oldVectors.map((oldVector, index) => {
        const { x, y } = plus(
          oldVector,
          times(differentialVectors[index], steps)
        )

        return { x, y }
      })

      this.currentVectors = transitionVectors

      const pathData = getPathData(transitionVectors)

      this.updatePath(pathData)
    }

    frames.call(this)
  }

  draw() {}

  update(vectorsArray) {
    const transformedVectors = this.transformVectors(vectorsArray)

    // Store final data for possible transitions
    this.currentVectors = transformedVectors

    const pathData = getPathData(transformedVectors)

    if (!this.path) return this.createPath(pathData)

    this.updatePath(pathData)
  }
}

// Init
void (function () {
  const vectorPoints = getRandomNumbers(100, 40).map((num, index) =>
    createVector(index, num)
  )
  const vectorPoints2 = getRandomNumbers(100, 40).map((num, index) =>
    createVector(index, num)
  )

  const svgGraph = document.querySelector("svg")

  const graph = new Graph(svgGraph, {
    padding: [50, 0, 0, 0],
  })

  graph.update(vectorPoints)

  window.onclick = () => {
    graph.transition(
      getRandomNumbers(100, 40).map((num, index) => createVector(index, num))
    )
  }

  window.onresize = () => {
    graph.init()
  }
})()
