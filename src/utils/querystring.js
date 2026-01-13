const appendQueryParams = (url, params) => {
  if (!params || !Object.keys(params).length) {
    return url;
  }
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      urlObj.searchParams.append(key, value);
    }
  });
  return urlObj.href;
};

export { appendQueryParams };
