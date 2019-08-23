;(function() {
  function applyAttributes(target, attributes) {
    for (let attr in attributes) {
      target.setAttribute(attr, attributes[attr])
    }
  }

  function calcPath(data) {
    return data.reduce((acc, d, i) => {
      const { x, y } = d

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

  // Get the dimensions of an svg
  function svgDimensions(svg) {
    const css = getComputedStyle(svg)

    return {
      width: Number(css.width.replace("px", "")),
      height: Number(css.height.replace("px", ""))
    }
  }

  // Create random data
  function randomData(length) {
    const array = []

    while (array.length < length) {
      array.push(10 * Math.round(10 * Math.random()))
    }

    return array.map((n, i) => ({ x: i, y: n, id: i }))
  }

  const ratio = (_dimension, _array) => {
    const min = 0 // Should also be passed in
    const max = Math.max(..._array)

    return _dimension / (max - min)
  }

  function pointsConverter(params) {
    let { container, padding } = params

    const verticalPadding =
      padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2
    const horizontalPadding =
      padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2

    return function(_array) {
      const { width, height } = svgDimensions(container)

      const xRatio = ratio(width - horizontalPadding, _array.map(d => d.x))
      const yRatio = ratio(height - verticalPadding, _array.map(d => d.y))

      return _array.map(_obj => {
        const obj = Object.assign({}, _obj)

        obj.x = obj.x * xRatio + (padding.length > 2 ? padding[3] : padding[1])
        obj.y =
          height -
          (obj.y * yRatio + (padding.length > 2 ? padding[2] : padding[0]))

        return obj
      })
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

  /**
   * Thinking about the best way to write the code, to keep it clean and beautiful, is something I struggle with.
   * I don't really know what's the best solution to everything. I pretty much understand closure, pure functions, but
   * creating good functional code, is still something I need to wrap my head around.
   * */

  const graph = document.getElementById("graph-2")
  const DATA = randomData(10)

  const convert = pointsConverter({
    container: graph,
    padding: [10, 10]
  })

  const styling = {
    stroke: "blue",
    "stroke-width": 2,
    fill: "none"
  }

  // Convert the raw data into fitting data for the svg
  const convertedData = convert(DATA)

  console.log(DATA, convertedData)

  const pathAttributes = Object.assign({}, styling, {
    d: calcPath(convertedData)
  })

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

  applyAttributes(path, pathAttributes)

  graph.appendChild(path)
})()
//
;(function() {
  const graph = document.getElementById("graph-2")

  // Get the dimensions from an element
  function getDimensions(_element) {
    const css = getComputedStyle(_element)

    return [
      Number(css.width.replace("px", "")),
      Number(css.height.replace("px", ""))
    ]
  }

  function createGraph(params) {
    const {
      container,
      padding,
      styling,
      data,
      type = "line",
      curve = "smooth"
    } = params

    const dimensions = getDimensions(container)

    const converter = pointsConverter({})

    const line = calcPath(data)

    // Append to container
    container.appendChild(path)

    // Return data transition functions
    return {
      updateData: function(_data) {},
      addData: function(_data) {}
    }
  }
})()
