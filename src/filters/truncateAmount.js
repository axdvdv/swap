alight.filters.truncateAmount = (value) => {
  let text = String(value)

  if (/\./.test(text)) {
    const [ match, unit, decimal ] = text.match(/(.+)\.(.+)/)

    return `${unit}.${decimal.substring(0, 3)}…`
  }

  return text
}
