;(function() {
  const graph = document.getElementById("graph-2")
  const DATA = randomData(10)

  // ++++++++++++++++++++++++++++++++++++++

  function lengthAngle(_a, _b, _end) {
    const xLength = _b.x - _a.x
    const yLength = _b.y - _a.y

    return [
      Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2)),
      Math.atan2(yLength, xLength) + (_end ? Math.PI : 0)
    ]
  }

  // ++++++++++++++++++++++++++++++++++++++

  function controlPoints(_data, _index, _end = false, _smoothing) {
    const previous = _data[_index - 1] || _data[_index]
    const next = _data[_index + 1] || _data[_index]

    const [length, angle] = lengthAngle(previous, next, _end)

    return [
      _data[_index].x + Math.cos(angle) * (length * _smoothing),
      _data[_index].y + Math.sin(angle) * (length * _smoothing)
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

    let xRatio, yRatio

    const verticalPadding =
      padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2
    const horizontalPadding =
      padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2

    return _array => {
      const { width, height } = getDimensions(container)

      if (_array.length > 1) {
        xRatio = ratio(width - horizontalPadding, _array.map(d => d.x))
        yRatio = ratio(height - verticalPadding, _array.map(d => d.y))
      }

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

  function getPathLine(_data, _pathEnd) {
    return (
      _data.reduce((acc, d, i) => {
        // If the data object contains remove, the controlpoints need to be the same as the points
        const smoothing = 0.15 * (d.remove != undefined ? d.remove : 1)
        const { x, y } = d

        if (i === 0) {
          return `${acc}M${x} ${y}`
        } else {
          const cpStart = controlPoints(_data, i - 1, false, smoothing)
          const cpEnd = controlPoints(_data, i, true, smoothing)

          return `${acc} C${cpStart[0]} ${cpStart[1]}, ${cpEnd[0]} ${
            cpEnd[1]
          }, ${x} ${y}`
        }
      }, "") + _pathEnd
    )
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

  function equalize(..._arrays) {
    let [oldData, newData] = _arrays

    if (newData.length >= oldData.length) {
      oldData = newData.map((d, i) => {
        if (!oldData[i]) {
          return Object.assign({}, oldData[oldData.length - 1], { id: d.id })
        }

        return oldData[i]
      })
    } else {
      oldData = oldData.map((d, i) => {
        if (!newData[i]) {
          return Object.assign({}, d, { remove: 1 })
        }

        return d
      })

      newData = oldData.map((d, i) => {
        if (!newData[i]) {
          return Object.assign({}, newData[newData.length - 1], { id: d.id })
        }

        return newData[i]
      })
    }

    return [oldData, newData]
  }

  // ++++++++++++++++++++++++++++++++++++++

  function dataTransition(_old, _new, _steps, _callback) {
    return new Promise((resolve, reject) => {
      const [oldData, newData] = equalize(_old, _new)

      const yCounter = newData.map((d, i) => (d.y - oldData[i].y) / _steps)
      const xCounter = newData.map((d, i) => (d.x - oldData[i].x) / _steps)

      updateTransition()

      function updateTransition(_counter = 0) {
        const outputData = oldData.map((d, i) => {
          const obj = Object.assign({}, d, {
            x: d.x + xCounter[i] * (_counter + 1),
            y: d.y + yCounter[i] * (_counter + 1)
          })

          if ("remove" in obj) {
            obj.remove = obj.remove - _counter / _steps
          }

          return obj
        })

        setTimeout(() => {
          _counter++

          if (_counter === _steps) {
            _callback(
              outputData.map(d => {
                const obj = Object.assign({}, d, {
                  x: Math.round(d.x),
                  y: Math.round(d.y)
                })

                if ("remove" in obj) {
                  obj.remove = 0
                }

                return obj
              })
            )

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

    const pathCap = () => {
      if (type == "area") {
        const { x, y } = convert([{ y: 0, x: 0 }])[0]

        return `V${y} H${x} Z`
      } else {
        return ""
      }
    }

    const pathAttributes = Object.assign({}, styling, {
      d: getPathLine(convert(data), pathCap())
    })

    const path = createSvgElement("path", pathAttributes)

    container.appendChild(path)

    // Return data transition functions
    return {
      updateData: async _data => {
        // Transition all the data, no deleting
        await dataTransition(data, _data, 20, _transitionData => {
          // Update the path

          path.setAttribute(
            "d",
            getPathLine(convert(_transitionData), pathCap())
          )
        })

        // Replace the old with the new
        data = _data
      },
      addData: async (..._data) => {
        const values = _data.flat()

        const newData = [...data].concat(
          values.map((d, i) => {
            return Object.assign({}, data[data.length - 1], {
              x: i + data.length,
              y: d,
              id: i + data.length
            })
          })
        )

        await dataTransition(data, newData, 20, _transitionData => {
          // Update the path
          path.setAttribute(
            "d",
            getPathLine(convert(_transitionData), pathCap())
          )
        })

        data = newData
      }
    }
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
      fill: "red"
    },
    type: "area",
    data: DATA
  })

  // setTimeout(
  //   () =>
  //     interactiveGraph.updateData(
  //       randomData(Math.round(Math.random() * 10) + 10)
  //     ),
  //   1000
  // )
  // setInterval(
  //   () => interactiveGraph.addData(Math.round(Math.random() * 20)),
  //   1000
  // )
  // interactiveGraph.addData(30, 50, 89)
})()
