const objectToQuerystring = (obj) => {
  if (!obj) {
    return '';
  }
  const keys = Object.keys(obj);

  if (!keys.length) {
    return '';
  }

  const query = keys.map((key) => `${key}=${obj[key]}`).join('&');
  return `?${query}`;
};

const appendQueryParams = (url, params) => {
  const queryString = objectToQuerystring(params);
  if (!queryString) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString.slice(1)}`;
};

export { objectToQuerystring, appendQueryParams };
