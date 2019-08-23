;(function() {
  const graph = document.getElementById("graph-2")
  const DATA = randomData(10)

  function lengthAngle(a, b, end) {
    const xLength = b.x - a.x
    const yLength = b.y - a.y

    return [
      Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2)) * 0.15,
      Math.atan2(yLength, xLength) + (end ? Math.PI : 0)
    ]
  }

  // Calculate the controlpoints for the bezier curve
  function controlPoints(data, index, end = false) {
    const previous = data[index - 1] || data[index]
    const next = data[index + 1] || data[index]

    const [length, angle] = lengthAngle(previous, next, end)

    return [
      data[index].x + Math.cos(angle) * length,
      data[index].y + Math.sin(angle) * length
    ]
  }

  // Get the dimensions from an element
  function getDimensions(_element) {
    const css = getComputedStyle(_element)

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

    return array.map((n, i) => ({ x: i, y: n, id: i })) // The id is used for calculating transitions
  }

  // Calculate the ratio between a dimension and an array
  const ratio = (_dimension, _array) => {
    const min = 0 // Should also be passed in
    const max = Math.max(..._array)

    return _dimension / (max - min)
  }

  // Set up the converter, by first passing in the container and paddings
  function pointsConverter(params) {
    const { container, padding } = params

    const verticalPadding =
      padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2
    const horizontalPadding =
      padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2

    return _array => {
      const { width, height } = getDimensions(container)

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

  function getPathLine(data) {
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

  function applyAttributes(_target, _attributes) {
    for (let attr in _attributes) {
      _target.setAttribute(attr, _attributes[attr])
    }
  }

  function createSvgElement(_type, _attributes) {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      _type
    )

    applyAttributes(element, _attributes)

    return element
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

    // const dimensions = getDimensions(container)

    const convert = pointsConverter({
      container: container,
      padding: padding
    })

    const pathAttributes = Object.assign({}, styling, {
      d: getPathLine(convert(data))
    })

    const path = createSvgElement("path", pathAttributes)

    // Append to container
    container.appendChild(path)

    // Return data transition functions
    return {
      updateData: function(_data) {},
      addData: function(_data) {}
    }
  }

  // Initialize the graph
  createGraph({
    container: graph,
    padding: [10, 20],
    styling: {
      stroke: "red",
      "stroke-width": "1",
      fill: "none"
    },
    data: DATA
  })
})()
