export const sendBeaconRequest = (url, data) => {
  const params = new FormData();

  // eslint-disable-next-line guard-for-in
  for (const key in data) {
    params.append(key, data[key]);
  }

  if (typeof window.navigator.sendBeacon !== 'function') {
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data),
      keepalive: true
    });
  }

  return window.navigator.sendBeacon(url, params);
};
