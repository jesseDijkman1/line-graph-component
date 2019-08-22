;(function() {
  function createPath(attributes) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    for (let attr in attributes) {
      path.setAttribute(attr, attributes[attr])
    }

    return path
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

    return [
      Number(css.width.replace("px", "")),
      Number(css.height.replace("px", ""))
    ]
  }

  // Create random data
  function randomData(length) {
    const array = []

    while (array.length < length) {
      array.push(10 * Math.round(10 * Math.random()))
    }

    return array.map((n, i) => ({ x: i, y: n, id: i }))
  }

  function pointsConverter(params) {
    let { dimensions, padding, data } = params

    const verticalPadding =
      padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2
    const horizontalPadding =
      padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2

    const width = dimensions[0] - horizontalPadding
    const height = dimensions[1] - verticalPadding

    const yRatio = () => {
      const yData = data.map(d => d.y)

      const yMin = 0
      const yMax = Math.max(...yData)

      return height / (yMax - yMin)
    }

    const xRatio = () => {
      const xData = data.map(d => d.x)

      const xMin = 0
      const xMax = Math.max(...xData)

      return width / (xMax - xMin)
    }

    return {
      convert: _obj => {
        const obj = Object.assign({}, _obj)

        obj.x =
          obj.x * xRatio() + (padding.length > 2 ? padding[3] : padding[1])
        obj.y =
          dimensions[1] -
          (obj.y * yRatio() + (padding.length > 2 ? padding[2] : padding[0]))

        return obj
      },
      update: newParams => {
        if (typeof newParams == "object") {
          dimensions = newParams.dimensions || dimensions
          padding = newParams.padding || padding
          data = newParams.data || data
        }
      }
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

  const converter = pointsConverter({
    dimensions: svgDimensions(graph),
    padding: [10, 10],
    data: DATA
  })

  const styling = {
    stroke: "blue",
    "stroke-width": 2,
    fill: "none"
  }

  const convertedData = DATA.map(converter.convert)

  const pathAttributes = Object.assign({}, styling, {
    d: calcPath(convertedData)
  })

  const path = createPath(pathAttributes)

  graph.appendChild(path)
})()
