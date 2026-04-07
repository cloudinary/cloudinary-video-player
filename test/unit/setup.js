if (typeof globalThis.CSS === 'undefined') {
  globalThis.CSS = {};
}
if (typeof globalThis.CSS.escape !== 'function') {
  globalThis.CSS.escape = (value) => {
    const str = String(value);
    return str.replace(/([^\w-])/g, '\\$1');
  };
}
