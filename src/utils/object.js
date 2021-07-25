
/**
 * a nested value from an object
 * @param  {object} value -  a object you want to get a nested value from
 * @param  {string} path - path to the nested value, key separated by . (dots)
 * @param  {any} defaultValue - a default Value in case the value is not defined
 * @returns a nested value from an object / array
 */
export const get = (value, path, defaultValue) => {
  if (value && typeof value === 'object') {
    const keysArray = path.split('.');
    let getValue = value;

    for (let objectValue of keysArray) {
      if (Object.prototype.hasOwnProperty.call(getValue, objectValue) && getValue[objectValue] !== undefined) {
        getValue = getValue[objectValue];
      } else {
        return defaultValue;
      }
    }

    return getValue;
  }

  return defaultValue;
};
