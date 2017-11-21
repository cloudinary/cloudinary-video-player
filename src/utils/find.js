function find(list, callback) {
  if (Array.prototype.find && Array.isArray(list)) {
    return list.find(callback);
  }

  return findElementAndIndex(list, callback)[0];
}

function findIndex(list, callback) {
  if (Array.prototype.findIndex) {
    return list.findIndex(callback);
  }

  return findElementAndIndex(list, callback)[1];
}

function findElementAndIndex(list, callback) {
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (callback(element, i, list)) {
      return [element, i];
    }
  }

  return [undefined, -1];
}

export { find, findIndex, findElementAndIndex };
