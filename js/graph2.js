;(function() {
  const graph = document.getElementById("graph-2")
  const DATA = randomData(10)

  // ++++++++++++++++++++++++++++++++++++++

  function lengthAngle(a, b, end) {
    const xLength = b.x - a.x
    const yLength = b.y - a.y

    return [
      Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2)) * 0.15,
      Math.atan2(yLength, xLength) + (end ? Math.PI : 0)
    ]
  }

  // ++++++++++++++++++++++++++++++++++++++

  function controlPoints(data, index, end = false) {
    const previous = data[index - 1] || data[index]
    const next = data[index + 1] || data[index]

    const [length, angle] = lengthAngle(previous, next, end)

    return [
      data[index].x + Math.cos(angle) * length,
      data[index].y + Math.sin(angle) * length
    ]
  }

  // ++++++++++++++++++++++++++++++++++++++

  function getDimensions(_element) {
    const css = getComputedStyle(_element)

    return {
      width: Number(css.width.replace("px", "")),
      height: Number(css.height.replace("px", ""))
    }
  }

  // ++++++++++++++++++++++++++++++++++++++

  function randomData(_length) {
    const array = []

    while (array.length < _length) {
      array.push(10 * Math.round(10 * Math.random()))
    }

    return array.map((n, i) => ({ x: i, y: n, id: i })) // The id is used for calculating transitions
  }

  // ++++++++++++++++++++++++++++++++++++++

  const ratio = (_dimension, _array) => {
    const min = 0 // Should also be passed in
    const max = Math.max(..._array)

    return _dimension / (max - min)
  }

  // ++++++++++++++++++++++++++++++++++++++

  function pointsConverter(_params) {
    const { container, padding } = _params

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

  // ++++++++++++++++++++++++++++++++++++++

  function getPathLine(_data, _type, _curve) {
    return _data.reduce((acc, d, i) => {
      const { x, y } = d

      if (i === 0) {
        return `${acc}M${x} ${y}`
      } else {
        const cpStart = controlPoints(_data, i - 1)
        const cpEnd = controlPoints(_data, i, true)

        return `${acc} C${cpStart[0]} ${cpStart[1]}, ${cpEnd[0]} ${
          cpEnd[1]
        }, ${x} ${y}`
      }
    }, "")
  }

  // ++++++++++++++++++++++++++++++++++++++

  function applyAttributes(_target, _attributes) {
    for (let attr in _attributes) {
      _target.setAttribute(attr, _attributes[attr])
    }
  }

  // ++++++++++++++++++++++++++++++++++++++

  function createSvgElement(_type, _attributes) {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      _type
    )

    applyAttributes(element, _attributes)

    return element
  }

  // ++++++++++++++++++++++++++++++++++++++

  function createGraph(_params) {
    let {
      container,
      padding,
      styling,
      data,
      type = "line", // line or area
      curve = "smooth"
    } = _params

    const convert = pointsConverter({
      container: container,
      padding: padding
    })

    const pathAttributes = Object.assign({}, styling, {
      d: getPathLine(convert(data), type, curve)
    })

    const path = createSvgElement("path", pathAttributes)

    container.appendChild(path)

    // Return data transition functions
    return {
      updateData: async _data => {
        // Transition all the data, no deleting
        await transitionData(data, _data, 20, _transitionData => {
          // Update the path
          path.setAttribute("d", getPathLine(convert(_transitionData)))
        })

        // Replace the old with the new
        data = _data
      },
      addData: _value => {}
    }
  }

  function equalize(..._data) {
    // If the newData has more values than the old, the array must be equal to make a nice transition
    const [oldData, newData] = _data

    let lastData = undefined

    if (newData.length > oldData.length) {
      newData.forEach((d, i) => {
        if (!oldData[i]) {
          if (!lastData) {
            lastData = oldData[i - 1]
          }

          oldData.push({ x: lastData.x, y: lastData.y, id: i })
        }
      })
    }

    return [oldData, newData]
  }

  function transitionData(_old, _new, _steps, _callback) {
    return new Promise((resolve, reject) => {
      const [oldData, newData] = equalize(_old, _new)

      const yCounter = newData.map((d, i) => (d.y - oldData[i].y) / _steps)
      const xCounter = newData.map((d, i) => (d.x - oldData[i].x) / _steps)

      updateTransition()

      function updateTransition(_counter = 0) {
        const outputData = oldData.map((d, i) => ({
          x: d.x + xCounter[i] * (_counter + 1),
          y: d.y + yCounter[i] * (_counter + 1),
          id: d.id
        }))

        setTimeout(() => {
          _counter++

          if (_counter === _steps) {
            outputData.forEach(d => {
              d.x = Math.round(d.x)
              d.y = Math.round(d.y)
            })

            _callback(outputData)

            // Now the code after the transition can run, when using a then or async/await
            resolve()
          } else {
            _callback(outputData)

            return updateTransition(_counter)
          }
        }, 1000 / 60)
      }
    })
  }

  // ++++++++++++++++++++++++++++++++++++++
  // +++++++++++ Initialization +++++++++++
  // ++++++++++++++++++++++++++++++++++++++

  const interactiveGraph = createGraph({
    container: graph,
    padding: [10, 20],
    styling: {
      stroke: "red",
      "stroke-width": "1",
      fill: "none"
    },
    data: DATA
  })

  setTimeout(interactiveGraph.updateData.bind(null, randomData(10)), 1000)
})()
