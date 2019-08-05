;(function() {
  const graph = document.getElementById("graph-1")
  const DIMENSIONS = svgDimensions(graph)
  const DATA = randomData(10)

  // Probably shouldn't be a global
  let convert = pointsConverter({
    dimensions: DIMENSIONS,
    padding: [10, 10],
    data: DATA
  })

  function init() {
    const path = createPath(DATA, {
      stroke: "blue",
      "stroke-width": 2,
      fill: "none"
    })

    path.setAttribute("stroke", "green")

    graph.appendChild(path)
  }

  init()

  function randomData(length) {
    const data = []

    while (data.length < length) {
      data.push([data.length, 10 * Math.round(10 * Math.random())])
    }

    return data
  }

  // setInterval(() => {
  //   DATA.shift()

  //   DATA.push(randomData(10))

  //   pathTransition(DATA[0], DATA[1], 30)
  // }, 3000)

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

  function pointsConverter(params) {
    const { dimensions, padding, data } = params

    createRect(DIMENSIONS, padding)

    const verticalPadding =
      padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2
    const horizontalPadding =
      padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2

    const width = dimensions[0] - horizontalPadding
    const height = dimensions[1] - verticalPadding

    const yData = data.map(d => d[1])

    const min = 0
    const max = Math.max(...yData)

    const yRatio = height / (max - min)
    const xRatio = width / (data.length - 1)

    return (x, y) => [
      x * xRatio + (padding.length > 2 ? padding[3] : padding[1]),
      dimensions[1] -
        (y * yRatio + (padding.length > 2 ? padding[2] : padding[0]))
    ]
  }

  function lengthAngle(a, b, end) {
    const xLength = b[0] - a[0]
    const yLength = b[1] - a[1]

    return [
      Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2)) * 0.15,
      Math.atan2(yLength, xLength) + (end ? Math.PI : 0)
    ]
  }

  function controlPoints(data, index, end = false) {
    const previous = data[index - 1] || data[index]
    const next = data[index + 1] || data[index]

    const [length, angle] = lengthAngle(previous, next, end)

    return [
      data[index][0] + Math.cos(angle) * length,
      data[index][1] + Math.sin(angle) * length
    ]
  }

  function calcPath(data) {
    return data.reduce((acc, d, i) => {
      const [x, y] = d

      if (i === 0) {
        return `${acc}M${x} ${y}`
      } else {
        const cpStart = controlPoints(data, i - 1)
        const cpEnd = controlPoints(data, i, true)

        return `${acc} C${cpStart[0]} ${cpStart[1]}, ${cpEnd[0]} ${
          cpEnd[1]
        }, ${x} ${y}`
      }
    }, "")
  }
  function createPath(_data, style) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    const data = _data.map(d => convert(...d)) // Convert the data into coordinates, based on the svg height and width

    const attributes = style

    attributes.d = calcPath(data)

    applyAttributes(path, attributes)

    return path
  }

  function createRect(dimensions, padding) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")

    applyAttributes(rect, {
      stroke: "red",
      "stroke-width": "1",
      x: padding.length > 2 ? padding[3] : padding[1],
      y: padding.length > 2 ? padding[0] : padding[0],
      fill: "none",
      width:
        dimensions[0] -
        (padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2),
      height:
        dimensions[1] -
        (padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2)
    })

    graph.appendChild(rect)
  }

  const dimensions = svgDimensions(graph)

  function updatePath(dz) {
    const paths = document.querySelector("#graph-1 path")

    const convert2 = pointsConverter(dimensions, [10, 10], dz)

    const data = dz.map(d => convert2(...d))

    const d = calcPath(data)

    paths.setAttribute("d", d)
  }

  function pathTransition(a1, a2, steps) {
    const [startData, endData] = [[...a1], [...a2]]

    const counterArray = endData.map((d, i) => (d[1] - startData[i][1]) / steps)

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
