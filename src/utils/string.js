function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase())
}

function coerce(string) {
  let val = string

  try {
    val = JSON.parse(val)
  } catch (e) {
    // Continue execution in case str is not parsable
  }

  if (val) {
    return val
  }

  val = Number(val)
  if (val) {
    return val
  }

  // TODO: Parse date?

  return val
}

export { capitalize, camelize, coerce }
