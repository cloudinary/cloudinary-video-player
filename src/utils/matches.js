
// Test for matches()/
const elMatches = (el, selector) => {
  let p = Element.prototype;
  let f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
    return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
  };
  return f.call(el, selector);
};

export { elMatches };
