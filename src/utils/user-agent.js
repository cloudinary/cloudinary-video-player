function isIE11() {
  let ua = window.navigator.userAgent;
  let trident = ua.indexOf('Trident/');

  if (trident > 0) {
    // IE 11 => return version number
    let rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  return false;
}

module.exports = { isIE11 };
