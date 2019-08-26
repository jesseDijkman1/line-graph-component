;(function() {
  const graph = document.getElementById("graph-2")
  const DATA = randomData(10)
  const DATA2 = randomData(7)

  const newValues = [10, 30, 50, 80, 10, 20, 70, 30]

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
    const { container, padding, data } = _params

    const dimensions = getDimensions(container)

    const verticalPadding =
      padding.length > 2 ? padding[0] + padding[2] : padding[0] * 2
    const horizontalPadding =
      padding.length > 2 ? padding[1] + padding[3] : padding[1] * 2

    return (_x, _y, _data = data) => {
      const xRatio = ratio(
        dimensions.width - horizontalPadding,
        _data.map(d => d.x)
      )
      const yRatio = ratio(
        dimensions.height - verticalPadding,
        _data.map(d => d.y)
      )

      const x =
        typeof _x === "number"
          ? _x * xRatio + (padding.length > 2 ? padding[3] : padding[1])
          : null
      const y =
        typeof _y === "number"
          ? dimensions.height -
            (_y * yRatio + (padding.length > 2 ? padding[2] : padding[0]))
          : null

      return { x: x, y: y }
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

  function getPathLine(_data, _pathEnd) {
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
        return {
          x: _data[i - 1].x,
          y: _data[i - 1].y,
          id: d.id,
          curveFactor: 0.05
          // Maybe add curvefactor = 0
        }
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

      if (i > 0 && "shift" in _data[i - 1]) {
        return Object.assign(
          {},
          {
            x: d.x,
            y: d.y,
            id: d.id,
            curveFactor: 1
          }
        )
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

      if (_data.some(d => Object.keys(d).includes("shift"))) {
        return Object.assign({}, { x: d.x - 1, y: d.y, id: d.id })
      }
      return d
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

          if ("curveFactor" in d) {
            obj.curveFactor = Number(
              Math.abs(obj.curveFactor - _counter / _steps).toFixed(3)
            )
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
                  y: Math.round(d.y),
                  id: d.id
                })

                if ("curveFactor" in d) {
                  obj.curveFactor = Math.round(obj.curveFactor)
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

  function cleanData(_data, _filterKey, _deleteObject = false) {
    let cleanedData

    if (!_deleteObject) {
      cleanedData = _data.map(d => {
        const obj = Object.assign({}, d)

        if (_filterKey in obj) {
          delete obj[_filterKey]
        }
        return obj
      })
    } else {
      cleanedData = _data.filter((d, i) => {
        if (!("curveFactor" in d)) {
          return Object.assign({}, d, { id: d.x })
        }
      })
    }

    return cleanedData
    // return rewriteIds(cleanedData)
  }

  // ++++++++++++++++++++++++++++++++++++++

  function rewriteIds(_data) {
    return _data.map((d, i) => Object.assign({}, d, { id: i }))
  }

  const pathCap = (_x, _y) => `V${_y} H${_x} Z`

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
      padding: padding,
      data: data
    })

    // The coordinates for the bottom left cornor, used for the pathCap()
    const baseCoordinates = convert(0, 0)

    // Convert the x and y from the data into fitting coordinates for the path
    let svgData = data.map(d => Object.assign({}, d, convert(d.x, d.y)))

    // Calculates the d attribute for the path, you can pass in a cap to close it, or leave it as a line chart
    let pathData = getPathLine(
      svgData,
      type === "area" ? pathCap(baseCoordinates.x, baseCoordinates.y) : ""
    )

    // Combine the styling and path data into an attributes package
    let pathAttributes = Object.assign({}, styling, { d: pathData })

    // Create the path element with the path attributes
    const path = createSvgElement("path", pathAttributes)

    container.appendChild(path)

    return {
      updateGraph: async _new => {
        // Check if the _new data is the original but changed or entirely new data
        const alteredOriginal = _new.some(
          d =>
            Object.keys(d).includes("shift") || Object.keys(d).includes("push")
        )

        const transitionData = alteredOriginal
          ? equalizeChange(_new)
          : equalizeAll(data, _new)

        // Change this on window resize

        await dataTransition(transitionData, 100, _returnData => {
          // Update the converter for the new data

          console.log(_returnData)
          let svgData = _returnData.map(d =>
            Object.assign({}, d, convert(d.x, d.y, _returnData))
          )

          let pathData = getPathLine(
            svgData,
            type === "area" ? pathCap(baseCoordinates.x, baseCoordinates.y) : ""
          )

          path.setAttribute("d", pathData)
        })

        // Replace the old with the new
        data = cleanData(transitionData[1], "push", false)

        data = cleanData(data, "remove", true)

        data = rewriteIds(data)

        return Promise.resolve()
      },
      addValue: (_value, _maxLength) => {
        let _data = [...data]

        if (typeof _maxLength === "number" && data.length + 1 >= _maxLength) {
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

  // interactiveGraph.updateGraph(DATA2)
  streamValues(newValues, 11)

  // const __data = interactiveGraph.addValue(40, 11)
  // interactiveGraph.updateGraph(__data)

  async function streamValues(_values, _maxLength = undefined) {
    const value = _values.shift()

    const data = interactiveGraph.addValue(value, _maxLength)

    await interactiveGraph.updateGraph(data)

    if (_values.length > 0) {
      return streamValues(_values, _maxLength)
    }

    return
  }
})()
