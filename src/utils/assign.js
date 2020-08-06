/**
 * Object.assign-style object shallow merge/extend.
 *
 * @param  {Object} target
 * @param  {Object} ...sources
 * @return {Object}
 */
function assign(target, ...sources) {
  if (Object.assign) {
    return Object.assign(target, ...sources);
  }

  sources.forEach(source => {
    if (!source) {
      return;
    }

    Object.keys(source).forEach((key) => {
      const value = source[key];
      target[key] = value;
    });
  });

  return target;
}

export { assign };
