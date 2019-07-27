const data = [0, 30, 10, 50, 20, 50, 120]

const graph1 = document.querySelector("#graph-1 svg")

function svgDimensions(svg) {
  const css = getComputedStyle(svg)

  return {
    width: Number(css.width.replace("px", "")),
    height: Number(css.height.replace("px", ""))
  }
}

function applyAttributes(target, attributes) {
  for (let attr in attributes) {
    target.setAttribute(attr, attributes[attr])
  }
}

function xAxis(props) {
  const {
    xRange,
    yRange,
    color = "blue",
    thickness,
    text = false,
    font,
    data
  } = props

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g")

  const horizontalLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  )

  // Set the coordinates for the horizontal line
  applyAttributes(horizontalLine, {
    x1: xRange[0],
    x2: xRange[1],
    y1: yRange[1],
    y2: yRange[1]
  })

  // Set the styling for the horizontal line
  applyAttributes(horizontalLine, {
    stroke: typeof color == "object" ? color[0] : color,
    "stroke-width": thickness[0] || thickness || 1
  })

  // Add horizontal line to the container
  container.appendChild(horizontalLine)

  // Create the vertical lines
  for (let i = 0; i <= data.length; i++) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    const verticalLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    )

    const xStep = (xRange[1] - xRange[0]) / data.length

    // Set the coordinates for the vertical line
    applyAttributes(verticalLine, {
      x1: xRange[0] + i * xStep,
      x2: xRange[0] + i * xStep,
      y1: yRange[0],
      y2: yRange[1]
    })

    // Set the styling for the vertical line
    applyAttributes(verticalLine, {
      stroke: typeof color == "object" ? color[1] || color[0] : color,
      "stroke-width": thickness[1] || thickness || 1
    })

    // Add vertical line to the group
    group.appendChild(verticalLine)

    // Add text if specified
    if (text) {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      )

      if (text === true) {
        // Text is true use i as text
        const text = document.createTextNode(i)

        label.appendChild(text)
      } else if (typeof text === "string") {
        // Use the string as key for the data
      }

      // Set the coordinates for the label
      applyAttributes(label, {
        x: i * xStep + xRange[0],
        y: yRange[1] + font
      })

      // Set the styling for the label
      applyAttributes(label, {
        fill:
          typeof color == "object" ? color[2] || color[1] || color[0] : color,
        "font-size": font,
        "text-anchor": "middle"
      })

      group.appendChild(label)
    }

    container.appendChild(group)
  }

  return container
}

function yAxis(props) {
  const {
    xRange,
    yRange,
    color = "blue",
    thickness = 1,
    text = false,
    amount = 1,
    font,
    minmax
  } = props

  const container = document.createElementNS("http://www.w3.org/2000/svg", "g")

  const verticalLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  )

  // Set the coordinates for the vertical line
  applyAttributes(verticalLine, {
    x1: xRange[0],
    x2: xRange[0],
    y1: yRange[0],
    y2: yRange[1]
  })

  // Set the styling for the vertical line
  applyAttributes(verticalLine, {
    stroke: typeof color == "object" ? color[0] : color,
    "stroke-width": typeof thickness == "object" ? thickness[0] : thickness
  })

  // Add vertical line to the container
  container.appendChild(verticalLine)

  // Create the horizontal lines
  for (let i = 0; i <= amount - 1; i++) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    const yStep = (yRange[1] - yRange[0]) / (amount - 1)

    if (i < amount - 1) {
      const horizontalLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      )

      // Set the coordinates for the vertical line
      applyAttributes(horizontalLine, {
        y1: yRange[0] + i * yStep,
        y2: yRange[0] + i * yStep,
        x1: xRange[0],
        x2: xRange[1]
      })

      // Set the styling for the vertical line
      applyAttributes(horizontalLine, {
        stroke: typeof color == "object" ? color[1] || color[0] : color,
        "stroke-width":
          typeof thickness == "object"
            ? thickness[1] || thickness[0]
            : thickness
      })

      // Add vertical line to the group
      group.appendChild(horizontalLine)
    }

    // Add text if specified
    if (text) {
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      )

      if (text === true) {
        // Text is true use i as text
        const text = document.createTextNode(
          Math.round(((minmax[1] - minmax[0]) / (amount - 1)) * i)
        )

        label.appendChild(text)
      } else if (typeof text === "string") {
        // Use the string as key for the data
      }

      // Set the coordinates for the label
      applyAttributes(label, {
        y: yRange[1] - i * yStep,
        x: xRange[0] - font / 2
      })

      // Set the styling for the label
      applyAttributes(label, {
        fill:
          typeof color == "object" ? color[2] || color[1] || color[0] : color,
        "font-size": font,
        "text-anchor": "end",
        "alignment-baseline": "middle"
      })

      group.appendChild(label)
    }

    container.appendChild(group)
  }

  return container
}

const dimensions = svgDimensions(graph1)

graph1.appendChild(
  xAxis({
    xRange: [50, dimensions.width - 25],
    yRange: [25, dimensions.height - 25],
    color: ["grey", "grey", "black"],
    thickness: [3, 1],
    text: true,
    font: 20,
    data: data
  })
)

const t = yAxis({
  xRange: [50, dimensions.width - 25],
  yRange: [25, dimensions.height - 25],
  color: ["grey", "grey", "black"],
  thickness: [3, 1],
  amount: 5,
  text: true,
  font: 15,
  minmax: [0, Math.max(...data) + 50]
})

graph1.appendChild(t)
