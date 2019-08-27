const types = {
  figma: [
    'qr',
    'rect',
    'patq',
    'text',
    'sigil',
    'img',
    'wrapAddrSplitFour',
    'addrSplitFour',
    'templateText',
    'hr',
  ],
  text: [
    'template_text',
    'text',
    'patq',
    'wrap_addr_split_four',
    'addr_split_four',
  ],
  // types whose data is retrieved asynchronously (we do not import the figma data)
  async: ['sigil', 'qr'],
  // these Figma types house children elements, so we need to transverse all children nodes when we find a parentType
  singleParent: ['group', 'instance', 'frame'],
}

// const toBase64 = url => {
//   image2base64(url)
//     .then(response => {
//       console.log(response)
//       return response
//     })
//     .catch(error => {
//       console.error(error)
//       return null
//     })
// }

// const genSvg = (child) => {
//   const path = child.fillGeometry[0].path
//
//   if (path === undefined || path === null || path === '')
//     console.error(
//       `Unable gen svg for child: ${JSON.stringify(child)}`
//     )
//
//     // create the svg element
//       const ast = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//       ast.
//
//       // set width and height
//       ast.setAttribute("width", child.absoluteBoundingBox.width);
//       ast.setAttribute("height", child.absoluteBoundingBox.height);
//
//   const ast = `<svg height="${child.absoluteBoundingBox.height}" width="${child.absoluteBoundingBox.width}"><path d="${path}"/></svg>`
//   return ast
// }

const genSvgPath = (child) => {
  const path = child.fillGeometry[0].path
  if (path === undefined || path === null || path === '')
    console.error(`Unable gen svg for child: ${JSON.stringify(child)}`)
  return path
}

const rgba = (fills) => {
  if (fills.length === 0) return `rgba(0,0,0,0)`
  const color = fills[0].color
  const red = Math.floor(color.r * 255)
  const green = Math.floor(color.g * 255)
  const blue = Math.floor(color.b * 255)
  const alpha = Math.floor(color.a)
  return `rgba(${red},${green},${blue},${alpha})`
}

const isType = (type) => {
  if (
    types.figma.includes(type) ||
    types.async.includes(type) ||
    types.singleParent.includes(type)
  )
    return true
  return false
}

const getPath = (child) => {
  const str = child.name
  if (str.includes('@')) {
    return str.split('@')[1]
  }
  return null
}

const qr = (child, page) => {
  return {
    type: 'qr',
    draw: 'qr',
    data: null,
    path: getPath(child),
    size: child.absoluteBoundingBox.height,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const sigil = (child, page) => {
  return {
    type: 'sigil',
    draw: 'sigil',
    data: null,
    path: getPath(child),
    size: child.absoluteBoundingBox.height,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const img = (child, page) => {
  return {
    type: 'img',
    draw: 'img',
    data: genSvgPath(child),
    path: getPath(child),
    width: child.absoluteBoundingBox.height,
    height: child.absoluteBoundingBox.width,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    color: rgba(child.fills),
  }
}

const text = (child, page) => {
  return {
    type: 'text',
    draw: 'wrappedText',
    path: null,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    data: child.characters,
    fontWeight: child.style.fontWeight,
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const templateText = (child, page) => {
  return {
    type: 'templateText',
    draw: 'wrappedText',
    path: getPath(child),
    data: null,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    fontWeight: child.style.fontWeight,
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const patq = (child, page) => {
  return {
    type: 'patq',
    draw: 'patq',
    path: getPath(child),
    data: null,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    fontWeight: child.style.fontWeight,
    fontColor: rgba(child.fills),
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const addrSplitFour = (child, page) => {
  return {
    type: 'addrSplitFour',
    draw: 'ethereumAddressLong',
    path: getPath(child),
    data: null,
    fontWeight: child.style.fontWeight,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    // text: getPath(child),
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const wrapAddrSplitFour = (child, page) => {
  return {
    type: 'wrapAddrSplitFour',
    draw: 'ethereumAddressCompact',
    path: getPath(child),
    data: null,
    fontWeight: child.style.fontWeight,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const rect = (child, page) => {
  return {
    type: 'rect',
    draw: 'rect',
    path: getPath(child),
    data: null,
    cornerRadius: child.cornerRadius,
    dashes: child.strokeDashes,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    width: child.absoluteBoundingBox.width,
    height: child.absoluteBoundingBox.height,
    fillColor: rgba(child.fills),
    strokeColor: rgba(child.strokes),
    strokeWeight: child.strokeWeight,
  }
}

const hr = (child, page) => {
  return {
    type: 'hr',
    draw: 'line',
    path: getPath(child),
    data: null,
    dashes: child.strokeDashes,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    width: child.absoluteBoundingBox.width,
    height: child.absoluteBoundingBox.height,
    strokeColor: rgba(child.strokes),
    strokeWeight: child.strokeWeight,
  }
}

const components = {
  qr: (child, page) => qr(child, page),
  templateText: (child, page) => templateText(child, page),
  rect: (child, page) => rect(child, page),
  patq: (child, page) => patq(child, page),
  text: (child, page) => text(child, page),
  sigil: (child, page) => sigil(child, page),
  img: (child, page) => img(child, page),
  wrapAddrSplitFour: (child, page) => wrapAddrSplitFour(child, page),
  addrSplitFour: (child, page) => addrSplitFour(child, page),
  hr: (child, page) => hr(child, page),
}

const getComponent = (child, name, page) => {
  const component = components[name]
  if (component === undefined) {
    return null
  }
  return component(child, page)
}

module.exports = {
  getComponent,
  types,
  isType,
}
