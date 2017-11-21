function isPlainObject(obj) {
  return obj !== null &&
    typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object Object]';
}

function isString(obj) {
  return obj instanceof String || typeof obj === 'string';
}

function isInteger(data) {
  return typeof data === 'number' && (data % 1) === 0;
}

export { isPlainObject, isString, isInteger };
