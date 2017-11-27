const USER_AGENT = window.navigator && window.navigator.userAgent || '';

const IS_IPAD = (/iPad/i).test(USER_AGENT);

// The Facebook app's UIWebView identifies as both an iPhone and iPad, so
// to identify iPhones, we need to exclude iPads.
// http://artsy.github.io/blog/2012/10/18/the-perils-of-ios-user-agent-sniffing/
const IS_IPHONE = (/iPhone/i).test(USER_AGENT) && !IS_IPAD;
const IS_IPOD = (/iPod/i).test(USER_AGENT);
const IS_IOS = IS_IPHONE || IS_IPAD || IS_IPOD;

const IS_ANDROID = (/Android/i).test(USER_AGENT);

const IS_IE11 = (function() {
  let ua = window.navigator.userAgent;
  let trident = ua.indexOf('Trident/');

  if (trident > 0) {
    // IE 11 => return version number
    let rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  return false;
}());

module.exports = { IS_IPAD, IS_IPHONE, IS_IOS, IS_ANDROID, IS_IE11 };
