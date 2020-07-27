const objectToQuerystring = (obj) => {
  const keys = Object.keys(obj);

  if (!keys.length) {
    return '';
  }

  const query = keys.map((key) => `${key}=${obj[key]}`).join('&');
  return `?${query}`;
};

export { objectToQuerystring };
