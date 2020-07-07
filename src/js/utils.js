function scaler(min, max) {
  return (val) => val * (max - min) + min
}

function normalizer(min, max) {
  return (value) => (value - min) / (max - min)
}

class Vector {
  static minus(vector1, vector2) {
    return {
      x: vector1.x - vector2.x,
      y: vector1.y - vector2.y,
    }
  }

  static plus(vector1, vector2) {
    return {
      x: vector1.x + vector2.x,
      y: vector1.y + vector2.y,
    }
  }

  static multiply(vector, num) {
    return {
      x: vector.x * num,
      y: vector.y * num,
    }
  }

  constructor(x, y) {
    this.x = x
    this.y = y
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

function animate() {
  let id

  return function (cb) {
    if (id) cancelAnimationFrame(id)

    function frames() {
      const stop = !!cb() // Should return true when done

      if (stop == true) return (id = null)

      id = requestAnimationFrame(frames)
    }

    id = requestAnimationFrame(frames)
  }
}

export {
  scaler,
  Vector,
  // plus,
  // difference,
  getRandomNumbers,
  normalizer,
  // createVector,
  getSvgDimensions,
  getPathData,
  // times,
  createPath,
  animate,
}
