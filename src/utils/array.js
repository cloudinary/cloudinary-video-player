
export const castArray = (value) => Array.isArray(value) ? value : [value];

export const forEach = (value, callback) => {
  if (Array.isArray(value) && value.length) {
    value.forEach(callback);
  }
};

export const some = (value, callback) => {
  if (Array.isArray(value) && value.length) {
    return value.some(callback);
  }

  return false;
};

export const map = (value, callback) => {
  if (Array.isArray(value) && value.length) {
    return value.map(callback);
  }
};
