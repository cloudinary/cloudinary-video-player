function isPlainObject(obj) {
  return obj !== null &&
    typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object Object]';
}

function isString(obj) {
  return obj instanceof String || typeof obj === 'string';
}

function isNumber(data) {
  return data instanceof Number || typeof data === 'number';
}

function isInteger(data) {
  return typeof data === 'number' && (data % 1) === 0;
}

function isBoolean(data) {
  return typeof data === 'boolean';
}

function isElement(value) {
  return value instanceof Element;
}

function isFunction(data) {
  return typeof data === 'function';
}

function noop() {
  return null;
}

export { isPlainObject, isString, isInteger, isNumber, isElement, noop, isFunction, isBoolean };
