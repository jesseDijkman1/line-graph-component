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

  function formatData(_x, _y, _index) {
    return {
      x: _x,
      y: _y,
      id: _index
    }
  }

  function xAxis() {}

  function init() {
    console.log(DATA)
    const path = createPath(DATA, {
      stroke: "blue",
      "stroke-width": 2,
      fill: "none"
    })

    // const yAxis = createAxis({
    //   min: 0,
    //   max: Math.max(...DATA.map(d => d[1])),
    //   lines: 5,
    //   direction: "vertical"
    // })

    graph.appendChild(path)
    // graph.appendChild(xAxis)
    // graph.appendChild(yAxis)
  }

  init()

  function randomData(length) {
    let data = []

    while (data.length < length) {
      data.push([data.length, 10 * Math.round(10 * Math.random())])
    }

    data = data.map((d, i) => formatData(d[0], d[1], i))

    return data
  }

  setTimeout(() => {
    pathTransition(DATA, randomData(12), 30)
  }, 1000)

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

    const yData = data.map(d => d.y)
    const xData = data.map(d => d.x)

    const yMin = 0
    const yMax = Math.max(...yData)

    const xMin = 0
    const xMax = Math.max(...xData)

    const yRatio = height / (yMax - yMin)
    const xRatio = width / (xMax - xMin)

    return function(_obj) {
      const obj = Object.assign({}, _obj)

      obj.x = obj.x * xRatio + (padding.length > 2 ? padding[3] : padding[1])
      obj.y =
        dimensions[1] -
        (obj.y * yRatio + (padding.length > 2 ? padding[2] : padding[0]))

      console.log(obj)

      return obj
    }
  }

  function lengthAngle(a, b, end) {
    const xLength = b.x - a.x
    const yLength = b.y - a.y

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
      data[index].x + Math.cos(angle) * length,
      data[index].y + Math.sin(angle) * length
    ]
  }

  function calcPath(data) {
    return data.reduce((acc, d, i) => {
      const { x, y } = d

      // const pp = document.createElementNS(
      //   "http://www.w3.org/2000/svg",
      //   "circle"
      // )

      // applyAttributes(pp, {
      //   cx: x,
      //   cy: y,
      //   r: 3,
      //   fill: "red"
      // })

      // graph.appendChild(pp)

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

    const data = _data.map(convert) // Convert the data into coordinates, based on the svg height and width

    const attributes = style

    attributes.d = calcPath(data)

    applyAttributes(path, attributes)

    return path
  }

  // Just a function that shows the boundaries of the path, with a rectangle
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

  function updatePath(_data) {
    const path = document.querySelector("#graph-1 path")

    convert = pointsConverter({
      dimensions: DIMENSIONS,
      padding: [10, 10],
      data: _data
    })

    const data = _data.map(convert)

    path.setAttribute("d", calcPath(data))
  }

  function equalize(..._data) {
    const [oldData, newData] = _data

    let lastData = undefined

    if (newData.length > oldData.length) {
      newData.forEach((d, i) => {
        if (!oldData[i]) {
          if (!lastData) {
            // lastX = newData[i - 1].x
            lastData = newData[i - 1]
          }

          oldData.push({ x: lastData.x, y: lastData.y, id: i })
        }
      })
    }

    return oldData
  }

  function pathTransition(_oldData, _newData, steps) {
    const oldData = equalize(_oldData, _newData)
    const newData = _newData

    const yCounter = newData.map((d, i) => (d.y - oldData[i].y) / steps)
    const xCounter = newData.map((d, i) => (d.x - oldData[i].x) / steps)

    let counter = 0

    updateTransition(oldData)

    function updateTransition(array) {
      const outputData = array.map((d, i) => {
        return {
          x: d.x + xCounter[i],
          y: d.y + yCounter[i],
          id: d.id
        }
      })

      setTimeout(() => {
        counter++

        if (counter === steps) {
          outputData.forEach(d => {
            d.x = Math.round(d.x)
            d.y = Math.round(d.y)
          })
          updatePath(outputData)
        } else {
          updatePath(outputData)

          return updateTransition(outputData)
        }
      }, 1000 / 60)
    }
  }
})()
