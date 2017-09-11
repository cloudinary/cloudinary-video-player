function isPlainObject(obj) {
  return obj !== null &&
    typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object Object]';
}

function isString(obj) {
  return obj instanceof String || typeof obj === 'string';
}

export { isPlainObject, isString };
