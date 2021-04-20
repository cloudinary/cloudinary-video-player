
// Test for matches()/
export const elMatches = (el, selector) => {
  const p = Element.prototype;
  const f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
    return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
  };
  return f.call(el, selector);
};
