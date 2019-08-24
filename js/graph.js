;(function() {
  const graph = document.getElementById("graph-2")
  const DATA = randomData(10)
  const DATA2 = randomData(7)

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
    let previous = _data[_index - 1] || _data[_index]
    let next = _data[_index + 1] || _data[_index]

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

  function plotPoint(_x, _y, _color) {
    const points = document.getElementsByClassName("control_point")

    for (let i = 0; i < points.length; i++) {
      points[i].remove()
    }

    setTimeout(() => {
      const point = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      )

      applyAttributes(point, {
        cx: _x,
        cy: _y,
        r: 1,
        fill: _color,
        class: "control_point"
      })

      graph.appendChild(point)
    }, 0)
  }

  function getPathLine(_data, _pathEnd = "") {
    return (
      _data.reduce((acc, d, i) => {
        // If the data object contains remove, the controlpoints need to be the same as the points
        const smoothing =
          0.15 * (d.curveFactor != undefined ? d.curveFactor : 1)

        const { x, y } = d

        if (i === 0) {
          return `${acc}M${x} ${y}`
        } else {
          const cpStart = controlPoints(_data, i - 1, false, smoothing)
          const cpEnd = controlPoints(_data, i, true, smoothing)

          plotPoint(cpStart[0], cpStart[1], "blue")
          plotPoint(cpEnd[0], cpEnd[1], "yellow")
          plotPoint(x, y, "black")

          return `${acc} C${cpStart[0]} ${cpStart[1]}, ${cpEnd[0]} ${
            cpEnd[1]
          }, ${x} ${y}`
        }
      }, "") + _pathEnd
    )
  }

  // ++++++++++++++++++++++++++++++++++++++

  function applyAttributes(_target, _attributes) {
    for (let _attr in _attributes) {
      _target.setAttribute(_attr, _attributes[_attr])
    }
  }

  // ++++++++++++++++++++++++++++++++++++++

  function createSvgElement(_type, _attributes, _styles) {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      _type
    )

    applyAttributes(element, _attributes)

    return element
  }

  // ++++++++++++++++++++++++++++++++++++++

  function equalizeAll(..._arrays) {
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
          return Object.assign({}, d, { curveFactor: 1 })
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

  function equalizeChange(_data) {
    const startData = _data.map((d, i) => {
      if ("push" in d) {
        return Object.assign(
          {},
          {
            x: _data[i - 1].x,
            y: _data[i - 1].y,
            id: d.id
          }
        )
      }

      if ("shift" in d) {
        return Object.assign(
          {},
          {
            x: d.x,
            y: d.y,
            id: d.id,
            curveFactor: 1,
            remove: true
          }
        )
      }

      if ("shift" in _data[i - 1]) {
        return Object.assign({}, d, { curveFactor: 1 })
      }

      return d
    })

    const endData = _data.map((d, i) => {
      if ("shift" in d) {
        return Object.assign(
          {},
          { x: d.x, y: _data[i + 1].y, id: d.id, curveFactor: 1 }
        )
      }

      return Object.assign({}, { x: d.x - 1, y: d.y, id: d.id })
    })

    return [startData, endData]
  }

  // ++++++++++++++++++++++++++++++++++++++

  function dataTransition(_data, _steps, _callback) {
    return new Promise((resolve, reject) => {
      const [oldData, newData] = _data

      const yCounter = {}
      const xCounter = {}

      newData.forEach(d => {
        xCounter[d.id] = (d.x - oldData.find(d2 => d2.id === d.id).x) / _steps
      })

      newData.forEach(d => {
        yCounter[d.id] = (d.y - oldData.find(d2 => d2.id === d.id).y) / _steps
      })

      updateTransition()

      function updateTransition(_counter = 0) {
        const outputData = oldData.map(d => {
          const obj = Object.assign({}, d, {
            x: d.x + xCounter[d.id] * (_counter + 1),
            y: d.y + yCounter[d.id] * (_counter + 1)
          })

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

                if ("curveFactor" in obj) {
                  obj.curveFactor = 0
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

  function cleanData(_data, _filterKey) {
    const cleanedData = _data.filter((d, i) => {
      if (!("curveFactor" in d)) {
        return Object.assign({}, d, { id: d.x })
      }
    })

    return cleanedData.map((d, i) => {
      return Object.assign({}, d, { id: i })
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

    const pathCap = () => {
      const { x, y } = convert([{ y: 0, x: 0 }])[0]

      return `V${y} H${x} Z`
    }

    const convert = pointsConverter({
      container: container,
      padding: padding
    })

    const pathAttributes = Object.assign({}, styling, {
      d: getPathLine(convert(data), type === "area" ? pathCap() : "")
    })

    const path = createSvgElement("path", pathAttributes)

    container.appendChild(path)

    // Return data transition functions
    return {
      updateData: async _new => {
        const alteredOriginal = _new.some(
          d =>
            Object.keys(d).includes("shift") || Object.keys(d).includes("push")
        )

        const transitionData = alteredOriginal
          ? equalizeChange(_new)
          : equalizeAll(data, _new)

        // Transition all the data, no deleting
        await dataTransition(transitionData, 20, _returnData => {
          // Update the path

          path.setAttribute("d", getPathLine(convert(_returnData), pathCap()))
        })

        // Replace the old with the new
        data = cleanData(transitionData[1], "remove")

        Promise.resolve()
      },
      addValue: (_value, _maxLength) => {
        let _data = [...data]

        if (typeof _maxLength === "number" && data.length + 1 > _maxLength) {
          _data = data.map((d, i) =>
            i === 0 ? Object.assign({}, d, { shift: 1 }) : d
          )
        }

        const obj = Object.assign({}, data[data.length - 1], {
          x: data.length,
          y: _value,
          id: data.length,
          push: 0
        })

        _data.push(obj)

        return _data
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

  // const _n = interactiveGraph.addValue(30, 5)

  // interactiveGraph.updateData(_n)

  const newValues = [50, 20, 70, 40, 10, 80, 10, 30, 20]

  // setInterval(() => newValues.push(Math.round(Math.random() * 90)), 500)

  streamValues(newValues)

  async function streamValues(_values, _maxLength = 9) {
    const value = _values.shift()

    const data = interactiveGraph.addValue(value, _maxLength)

    await interactiveGraph.updateData(data)

    if (_values.length > 0) {
      return streamValues(_values, _maxLength)
    }

    return
  }
})()
