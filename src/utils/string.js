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

// https://jsperf.com/js-camelcase/5
function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
      return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export { camelize, startsWith, toCamelCase };
