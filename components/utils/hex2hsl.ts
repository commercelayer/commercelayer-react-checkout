function removeHash(hex: string) {
  if (hex.charAt && hex.charAt(0) === "#") {
    const arr = hex.split("")
    arr.shift()
    return arr.join("")
  }
  return hex
}

function expand(hex: string) {
  return hex
    .split("")
    .reduce((acc: string[], value) => acc.concat([value, value]), [])
    .join("")
}

function hexToHSL(hex: string): HSLProps | undefined {
  if (!hex) return undefined

  let hexColor = removeHash(hex)

  if (hexColor.length === 3) {
    hexColor = expand(hexColor)
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor)
  if (!result) return undefined
  let r = Number.parseInt(result[1], 16)
  let g = Number.parseInt(result[2], 16)
  let b = Number.parseInt(result[3], 16)
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number
  let s: number
  const l = (max + min) / 2
  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
        break
    }

    h /= 6
    h *= 360
  }
  const HSL: HSLProps = {
    h,
    s: `${(s * 100).toFixed(2)}%`,
    l: `${(l * 100).toFixed(2)}%`,
  }

  return HSL
}

export default hexToHSL
