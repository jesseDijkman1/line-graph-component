;(function() {
  const graph = document.querySelector("#graph-2 svg")
  const DATA = [0, 30, 15, 30, 10, 30, 10, 80, 40, 20]

  function svgDimensions(svg) {
    const css = getComputedStyle(svg)

    return [
      Number(css.width.replace("px", "")),
      Number(css.height.replace("px", ""))
    ]
  }

  function calcSvgData(...arguments) {
    const [data, width, height, padding = [0, 0, 0, 0]] = arguments

    const min = Math.min(...data)
    const max = Math.max(...data)

    const yRatio = (height - (padding[0] + padding[2])) / (max - min)
    const xRatio = (width - (padding[1] + padding[3])) / (data.length - 1)

    return data.map((d, i) => [
      xRatio * i + padding[3], // x
      height - yRatio * (d - min) - padding[2] // y
    ])
  }

  function calcPathLine(data) {
    return data
      .map((d, i) => {
        if (i === 0) {
          return `M${d[0]} ${d[1]}`
        } else {
          return `L${d[0]} ${d[1]}`
        }
      })
      .join(" ")
  }

  function createPath(data) {
    const d = calcPathLine(data)

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    path.setAttribute("fill", "none")
    path.setAttribute("stroke", "blue")
    path.setAttribute("stroke-width", "2")
    path.setAttribute("d", d)

    return path
  }

  const dimensions = svgDimensions(graph)
  const padding = [10, 25, 10, 25]

  function calcStartEndLine(a, b, end) {
    const xLength = b[0] - a[0]
    const yLength = b[1] - a[1]

    const smoothing = 0.2

    return [
      Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2)) * smoothing,
      Math.atan(yLength, xLength) + end ? Math.PI : 0
    ]
  }

  function findControlPoint(data, index, end = false) {
    const previous = data[index - 1] || data[index]
    const next = data[index + 1] || data[index]

    const [length, angle] = calcStartEndLine(previous, next, end)

    const x = data[index][0] + Math.cos(angle) * length
    const y = data[index][1] + Math.sin(angle) * length

    return [x, y]
  }

  function cubicCurve(data, index) {
    const startCp = findControlPoint(data, index - 1)
    const endCp = findControlPoint(data, index, true)

    const cs = document.createElementNS("http://www.w3.org/2000/svg", "circle")

    cs.setAttribute("cx", startCp[0])
    cs.setAttribute("cy", startCp[1])

    cs.setAttribute("r", 2)
    cs.setAttribute("fill", "red")

    graph.appendChild(cs)

    const ce = document.createElementNS("http://www.w3.org/2000/svg", "circle")

    ce.setAttribute("cx", endCp[0])
    ce.setAttribute("cy", endCp[1])

    ce.setAttribute("r", 2)
    ce.setAttribute("fill", "blue")

    graph.appendChild(ce)

    return `C${startCp[0]} ${startCp[1]}, ${endCp[0]} ${endCp[1]}, ${
      data[index][0]
    } ${data[index][1]}`
  }

  function smoothLine(data) {
    return data
      .map((d, i) => {
        if (i === 0) {
          return `M${d[0]} ${d[1]}`
        } else {
          return cubicCurve(data, i)
        }
      })
      .join(" ")
  }

  function createSmoothPath(data) {
    const d = smoothLine(data)

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

    path.setAttribute("fill", "none")
    path.setAttribute("stroke", "red")
    path.setAttribute("stroke-width", "2")
    path.setAttribute("d", d)

    return path
  }

  const pathData = calcSvgData(DATA, ...dimensions, padding)

  const path = createPath(pathData)
  const smoothPath = createSmoothPath(pathData)

  graph.appendChild(path)
  graph.appendChild(smoothPath)
})()
