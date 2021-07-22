export const get = (value, path, defaultValue) => {
  if (value && typeof value === 'object') {
    const keysArray = path.split('.');
    let getValue = value;

    for (let objectValue of keysArray) {
      if (Object.prototype.hasOwnProperty.call(getValue, objectValue)) {
        getValue = getValue[objectValue];
      } else {
        return defaultValue;
      }
    }

    return getValue;
  }

  return defaultValue;
};
