function _sliceProperties(obj, isUnset, ...props) {
  return props.reduce((acc, prop) => {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      acc[prop] = obj[prop];
      if (isUnset) {
        delete obj[prop];
      }
    }
    return acc;
  }, {});
}

export const sliceProperties = (obj, ...props) => _sliceProperties(obj, false, ...props);

export const sliceAndUnsetProperties = (obj, ...props) => _sliceProperties(obj, true, ...props);
