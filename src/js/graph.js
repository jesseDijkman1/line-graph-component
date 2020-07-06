// Utils
function createVector(x, y) {
  return { x, y }
}

function svgDimensions(svg) {
  console.log("yes", svg, svg instanceof Element)
  const css = getComputedStyle(svg)

  return {
    width: Number(css.width.replace("px", "")),
    height: Number(css.height.replace("px", "")),
  }
}

function getPathData(points) {
  return points.reduce((acc, [x, y], index) => {
    if (index == 0) return `M${x} ${y}`
    else if (index == points.length - 1) return `${acc}, L${x} ${y}`
    else return `${acc}, L${x} ${y}`
  }, "")
}

function createPath({ d, stroke, fill }) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

  path.setAttributeNS(null, "d", d)
  path.setAttributeNS(null, "stroke", stroke)
  path.setAttributeNS(null, "fill", fill)

  return path
}

function scaler(min, max) {
  return (val) => val * (max - min) + min
}

function normalizer(min, max) {
  return (value) => (value - min) / (max - min)
}

const TEST_DATA = [
  [0, 90],
  [1, 30],
  [2, 10],
  [3, 50],
  [4, 20],
]

// Init
void (function () {
  const svgGraph = document.querySelector("svg")

  console.log(svgGraph)
  const { width, height } = svgDimensions(svgGraph)

  // Create scalers
  const scaleX = scaler(0, width)
  const scaleY = scaler(0, height)

  // Get seperate x and y array
  const xValues = TEST_DATA.map((points) => points[0])
  const yValues = TEST_DATA.map((points) => points[1])

  // Create normalize functions
  const normalizeX = normalizer(Math.min(...xValues), Math.max(...xValues))
  const normalizeY = normalizer(Math.min(...yValues), Math.max(...yValues))

  // Normalize original data
  const normalizedPointArrays = TEST_DATA.map(([x, y]) => [
    normalizeX(x),
    normalizeY(y),
  ])

  // console.log(normalizedPointArrays)

  // Points scaled for svg dimensions
  const scaledPointArrays = normalizedPointArrays.map(([x, y]) => [
    scaleX(x),
    scaleY(y),
  ])

  const pathData = getPathData(scaledPointArrays)

  const path = createPath({
    d: pathData,
    stroke: "red",
    fill: "none",
  })

  svgGraph.appendChild(path)

  // const scaleX = createScale(0, max)

  // Creates array with x as the array index ( [[0, y], [1, y], [2, y]] )
  // const rawPointsArray = TEST_DATA.map((number, i) => [i, number])
  // const scaledPointsArray
})()

exports.default = function () {
  console.log("test")
}
