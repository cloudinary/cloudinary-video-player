export const sendBeaconRequest = (url, data) => {
  if (typeof window.navigator.sendBeacon !== 'function') {
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true
    });
  }

  return window.navigator.sendBeacon(url, JSON.stringify(data));
};
