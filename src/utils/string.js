export const camelize = (str) => str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());

export const startsWith = (str, searchStr, position) => {
  if (String.prototype.startsWith) {
    return str.startsWith(searchStr, position);
  } else {
    const newPosition = position || 0;
    return str.indexOf(searchStr, newPosition) === newPosition;
  }
};
