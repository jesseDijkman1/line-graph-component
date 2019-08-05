;(function() {
  const graph = document.querySelector("#graph-3 svg")

  function randomData(length) {
    const data = []

    for (let i = 0; i < length; i++) {
      data.push([i, 10 * Math.round(10 * Math.random())])
    }

    return data
  }

  const DATA = [randomData(10), randomData(10)]

  setInterval(() => {
    DATA.shift()

    DATA.push(randomData(10))

    pathTransition(DATA[0], DATA[1], 30)
  }, 3000)

  function applyAttributes(target, attributes) {
    for (let attr in attributes) {
      target.setAttribute(attr, attributes[attr])
    }
  }

  function svgDimensions(svg) {
    const css = getComputedStyle(svg)

    return [
      Number(css.width.replace("px", "")),
      Number(css.height.replace("px", ""))
    ]
  }

  function pointsConverter(dimensions, padding, data) {
    const width = dimensions[0] - padding[0] * 2
    const height = dimensions[1] - padding[1] * 2

    const yData = data.map(d => d[1])

    const min = 0
    const max = Math.max(...yData)

    const yRatio = height / (max - min)
    const xRatio = width / (data.length - 1)

    console.log(min, max, yData)

    return (x, y) => [
      x * xRatio + padding[0],
      dimensions[1] - (y * yRatio + padding[1])
    ]
  }

  function lengthAngle(a, b) {
    const xLength = b[0] - a[0]
    const yLength = b[1] - a[1]

    return [
      Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2)) * 0.2,
      Math.atan2(yLength, xLength)
    ]
  }

  function controlPoints(p, current, n, end) {
    const previous = p || current
    const next = n || current

    let [length, angle] = lengthAngle(previous, next)

    if (end) angle = angle + Math.PI

    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length

    return [x, y]
  }

  function calcPath(data) {
    return data.reduce((acc, d, i) => {
      const [x, y] = d

      if (i === 0) {
        return `${acc}M${x} ${y}`
      } else {
        const cpStart = controlPoints(data[i - 2], data[i - 1], data[i])
        const cpEnd = controlPoints(data[i - 1], data[i], data[i + 1], true)

        return `${acc} C${cpStart[0]} ${cpStart[1]}, ${cpEnd[0]} ${
          cpEnd[1]
        }, ${x} ${y}`
      }
    }, "")
  }

  function createPath(data, style) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    const attributes = style

    attributes.d = calcPath(data)

    applyAttributes(path, attributes)

    return path
  }

  function createRect(dimensions, paddingH, paddingV) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

    applyAttributes(rect, {
      stroke: "red",
      "stroke-width": "1",
      x: paddingH,
      y: paddingV,
      fill: "none",
      width: dimensions[0] - paddingH * 2,
      height: dimensions[1] - paddingV * 2
    })

    graph.appendChild(rect)
  }

  function init() {
    const dimensions = svgDimensions(graph)
    const convert = pointsConverter(dimensions, [10, 10], DATA[0])

    createRect(dimensions, 10, 10)

    const data = DATA[0].map(d => convert(...d))

    const path = createPath(data, {
      stroke: "blue",
      "stroke-width": 2,
      fill: "none"
    })

    graph.appendChild(path)
  }

  init()

  const dimensions = svgDimensions(graph)

  function updatePath(dz) {
    const paths = document.querySelector("#graph-3 svg path")

    const convert2 = pointsConverter(dimensions, [10, 10], dz)

    const data = dz.map(d => convert2(...d))

    const d = calcPath(data)

    paths.setAttribute("d", d)
  }

  function pathTransition(a1, a2, steps) {
    const [startData, endData] = [[...a1], [...a2]]

    const counterArray = endData.map((d, i) => (d[1] - startData[i][1]) / steps)

    console.log(endData[0])

    let counter = 0

    updateTransition(startData)

    function updateTransition(array) {
      const outputData = array.map((d, i) => [d[0], d[1] + counterArray[i]])

      setTimeout(() => {
        counter++

        if (counter === steps) {
          updatePath(outputData.map(d => [d[0], Math.round(d[1])]))
        } else {
          updatePath(outputData)

          return updateTransition(outputData)
        }
      }, 1000 / 60)
    }
  }
})()
