alight.filters.truncate = (value, length) => {
  let text = String(value)

  if (text.length > length) {
    text = `${String(value).substring(0, length)}…`
  }

  return text
}
