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

  function calcSvgData(width, height, padding = [0, 0, 0, 0], data) {
    const min = 0
    const max = Math.max(...data)

    const yRatio = (height - (padding[0] + padding[2])) / (max - min)
    const xRatio = (width - (padding[1] + padding[3])) / (data.length - 1)

    return data.map((d, i) => [
      xRatio * i + padding[3],
      height - yRatio * (d - min) - padding[2]
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

  const pathData = calcSvgData(...dimensions, [10, 25, 10, 25], DATA)

  const path = createPath(pathData)

  graph.appendChild(path)
})()
