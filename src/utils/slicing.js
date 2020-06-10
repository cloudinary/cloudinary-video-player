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

function sliceProperties(obj, ...props) {
  return _sliceProperties(obj, false, ...props);
}

function sliceAndUnsetProperties(obj, ...props) {
  return _sliceProperties(obj, true, ...props);
}

export { sliceProperties, sliceAndUnsetProperties };
