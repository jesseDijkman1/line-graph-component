const data = [0, 30, 10, 50, 20]

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
