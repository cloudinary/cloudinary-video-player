function debounce(func, wait, immediate) {
  let timeout = null;

  return function(...args) {
    const self = this;

    const later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(self, args);
      }
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(self, args);
    }
  };
}

export default debounce;
