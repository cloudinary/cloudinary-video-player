function camelize(str) {
  return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
}

function startsWith(str, searchStr, position) {
  if (String.prototype.startsWith) {
    return str.startsWith(searchStr, position);
  } else {
    let position = position || 0;
    return str.indexOf(searchStr, position) === position;
  }
}

function camelToSnake(camelCaseString) {
  return camelCaseString.replace(/[A-Z]/g, function (match) {
    return '_' + match.toLowerCase();
  });
}

export { camelize, startsWith, camelToSnake };
