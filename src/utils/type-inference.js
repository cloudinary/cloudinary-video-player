export const isPlainObject = (obj) => (obj !== null && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]');

export const isString = (obj) => (obj instanceof String || typeof obj === 'string');

export const isInteger = (data) => (typeof data === 'number' && (data % 1) === 0);

