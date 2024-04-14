export function applyWithProps(context, obj) {
  Object.entries(obj).forEach(([key, value]) => {
    if (context[key] && typeof context[key] === 'function') {
      context[key](value);
    }
  });
}
