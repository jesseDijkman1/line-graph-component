;(function() {
  const graph = document.querySelector("#graph-3 svg")
  const DATA = [
    [0, 0],
    [1, 30],
    [2, 15],
    [3, 30],
    [4, 10],
    [5, 30],
    [6, 10],
    [7, 80],
    [8, 40],
    [9, 20]
  ]

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
    const width = dimensions[0] - padding[0]
    const height = dimensions[1] - padding[1]

    const yData = data.map(d => d[1])

    const min = Math.min(...yData)
    const max = Math.max(...yData)

    const yRatio = height / (max - min)
    const xRatio = width / (data.length - 1)

    return (x, y) => [
      x * xRatio + padding[0] / 2,
      height - y * yRatio + padding[1] / 2
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
    const attributes = style

    attributes.d = calcPath(data)

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    applyAttributes(path, attributes)

    return path
  }

  function init() {
    const dimensions = svgDimensions(graph)
    const convert = pointsConverter(dimensions, [10, 50], DATA)

    const data = DATA.map(d => convert(...d))

    const path = createPath(data, {
      stroke: "blue",
      "stroke-width": 2,
      fill: "none"
    })

    graph.appendChild(path)
  }

  init()
})()
