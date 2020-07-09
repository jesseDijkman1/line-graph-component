import {
  scaler,
  normalizer,
  getPathData,
  getRandomNumbers,
  getSvgDimensions,
  animate,
  createPath,
  Vector,
} from "./utils"

// Source: https://gist.github.com/gre/1650294
const EasingFunctions = {
  // no easing, no acceleration
  linear: (t) => t,
  // accelerating from zero velocity
  easeInQuad: (t) => t * t,
  // decelerating to zero velocity
  easeOutQuad: (t) => t * (2 - t),
  // acceleration until halfway, then deceleration
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  // accelerating from zero velocity
  easeInCubic: (t) => t * t * t,
  // decelerating to zero velocity
  easeOutCubic: (t) => --t * t * t + 1,
  // acceleration until halfway, then deceleration
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity
  easeInQuart: (t) => t * t * t * t,
  // acceleration until halfway,
}

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

    this.currentVectors = []
    this.currentVectorsRaw = []

    this.animate = animate()

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
    // Returns the X and Y values seperately
    return {
      xValues: vectorsArray.map(({ x }) => x),
      yValues: vectorsArray.map(({ y }) => y),
    }
  }

  closeVectors(vectorsArray) {
    return [
      {
        x: 0 + this.paddingLeft,
        y: this.height + this.paddingTop,
      },
      ...vectorsArray,
      {
        x: this.width + this.paddingLeft,
        y: this.height + this.paddingTop,
      },
    ]
  }

  transformVectors(vectorsArray) {
    const normalizedVectors = this.normalize(vectorsArray)
    const scaledVectors = this.scale(normalizedVectors)

    return scaledVectors
  }

  equalizeArrayLengths(currentVectorsArray, newVectorsArray) {
    const lengthDifference = Math.abs(
      currentVectorsArray.length - newVectorsArray.length
    )

    if (lengthDifference == 0) {
      return [currentVectorsArray, newVectorsArray]
    }

    const emptyfillers = new Array(lengthDifference)
    // const fillersLeft = new Array(Math.floor(lengthDifference))
    // const fillersRight = new Array(Math.ceil(lengthDifference))

    if (currentVectorsArray.length < newVectorsArray.length) {
      const adjusted = [
        // ...fillersLeft.fill(currentVectorsArray[0]),
        ...currentVectorsArray,
        ...emptyfillers.fill(
          currentVectorsArray[currentVectorsArray.length - 1]
        ),
      ]

      return [adjusted, newVectorsArray]
    } else {
      const adjusted = [
        ...emptyfillers.fill(newVectorsArray[0]),
        ...newVectorsArray,
        // ...fillersRight.fill(newVectorsArray[newVectorsArray.length - 1]),
      ]

      return [currentVectorsArray, adjusted]
    }
  }

  transition(vectorsArray, steps = 60) {
    let stepsTaken = 0

    const normalize = normalizer(0, steps)

    const transformedVectors = this.transformVectors(vectorsArray)

    const [currentVectors, newVectors] = this.equalizeArrayLengths(
      this.currentVectors,
      transformedVectors
    )

    const differentialVectors = newVectors.map((vector, index) =>
      Vector.minus(vector, currentVectors[index])
    )

    this.animate(() => {
      if (stepsTaken >= steps) {
        this.currentVectors = transformedVectors
        return true
      }

      stepsTaken++

      const transitionVectors = currentVectors.map((oldVector, index) =>
        Vector.plus(
          oldVector,
          Vector.multiply(
            differentialVectors[index],
            EasingFunctions.linear(normalize(stepsTaken))
          )
        )
      )

      this.currentVectorsRaw = vectorsArray
      this.currentVectors = transitionVectors

      this.draw()
    })
  }

  push(...vectors) {
    // const vectors = [_vectors]
    this.currentVectorsRaw = [...this.currentVectorsRaw, ...vectors].flat()
    // console.log(this.currentVectorsRaw, vectors, typeof vectors)

    this.transition(this.currentVectorsRaw)

    // this.draw()
  }

  shift() {
    console.log(this.currentVectorsRaw, this.currentVectors)
    this.currentVectorsRaw.shift()

    this.transition(this.currentVectorsRaw)
  }

  unshift() {}

  update(vectorsArray) {
    const transformedVectors = this.transformVectors(vectorsArray)

    this.currentVectorsRaw = vectorsArray
    this.currentVectors = transformedVectors

    this.draw()
  }

  draw() {
    const pathData = getPathData(
      this.fill != false
        ? this.closeVectors(this.currentVectors)
        : this.currentVectors
    )

    if (!this.path) return this.createPath(pathData)

    this.updatePath(pathData)
  }
}

// Init
void (function () {
  const vectorPoints = getRandomNumbers(100, 30).map(
    (num, index) => new Vector(index, num)
  )

  const svgGraph = document.querySelector("svg")

  const graph = new Graph(svgGraph, {
    padding: [50, 0, 0],
  })

  graph.update(vectorPoints)

  document.body.onclick = () => {
    graph.shift()
    // for (let i = 0; i < 10; i++) {
    graph.push([
      new Vector(
        graph.currentVectorsRaw[graph.currentVectorsRaw.length - 1].x + 1,
        Math.random() * 25 + 25
      ),
    ])
    // }

    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])
    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])
    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])
    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])
    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])
    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])
    // graph.push([
    //   new Vector(graph.currentVectors.length, Math.random() * 25 + 25),
    // ])

    // graph.transition(
    //   getRandomNumbers(100, Math.round(Math.random() * 25 + 25)).map(
    //     (num, index) => new Vector(index, num)
    //   )
    // )
  }

  window.onresize = () => {
    graph.init()
    graph.update(graph.currentVectors)
  }
})()
