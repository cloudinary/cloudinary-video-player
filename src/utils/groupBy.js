
const groupBy = (collection, iteratee) => collection.reduce((result, value, key) => {
  key = iteratee(value);
  if (Object.prototype.hasOwnProperty.call(result, key)) {
    result[key].push(value);
  } else {
    result[key] = [value];
  }
  return result;
}, {});

export { groupBy };
