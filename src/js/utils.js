function scaler(min, max) {
  return (val) => val * (max - min) + min
}

function normalizer(min, max) {
  return (value) => (value - min) / (max - min)
}

// Vector Helpers
function createVector(x, y) {
  return { x, y }
}

function difference(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
  }
}

function plus(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  }
}

function times(vector, num) {
  return {
    x: vector.x * num,
    y: vector.y * num,
  }
}

function getSvgDimensions(svg) {
  const css = getComputedStyle(svg)

  return {
    width: Number(css.width.replace("px", "")),
    height: Number(css.height.replace("px", "")),
  }
}

function getPathData(points) {
  return points.reduce((acc, { x, y }, index) => {
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

function getRandomNumbers(max, amount, round = true) {
  return new Array(amount)
    .fill(max)
    .map((m) =>
      round == true ? Math.random() * m : Math.round(Math.random() * m)
    )
}

export {
  scaler,
  plus,
  difference,
  getRandomNumbers,
  normalizer,
  createVector,
  getSvgDimensions,
  getPathData,
  times,
  createPath,
}
