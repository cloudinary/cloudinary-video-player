/* eslint no-var: "off", vars-on-top: "off", curly: "off" */

// Get scripts & styles from:
// `localhost` while developing
// `unpkg.com` while demoing OR if a specific version is specified

var loadScript = function (source, ver) {
  var external = source.startsWith('http');
  var from =
    !ver && (external || window.location.hostname === 'localhost')
      ? ''
      : 'https://unpkg.com/cloudinary-video-player@' + (ver || 'edge') + '/dist';
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = from + source;
  script.async = false;
  document.getElementsByTagName('head')[0].appendChild(script);
};

var loadStyle = function (source, ver) {
  var external = source.startsWith('http');
  var from =
    !ver && (external || window.location.hostname === 'localhost')
      ? ''
      : 'https://unpkg.com/cloudinary-video-player@' + (ver || 'edge') + '/dist';
  var style = document.createElement('link');
  style.type = 'text/css';
  style.rel = 'stylesheet';
  style.href = from + source;
  document.getElementsByTagName('head')[0].appendChild(style);
};

(function() {

  // Allows testing of various build flavors (min/light) & versions (1.1.x)
  var search = new URLSearchParams(window.location.search);
  var ver = search.get('ver');
  var flavor = search.get('flavor');
  if (ver || flavor) {
    // Maintain the 'ver' query param on internal links.
    window.addEventListener('load', function (e) {
      Array.from(document.querySelectorAll('a')).forEach(a => {
        if (a.hostname === location.hostname) {
          var url = new URL(a.href);
          if (ver) url.searchParams.set('ver', ver);
          if (flavor) url.searchParams.set('flavor', flavor);
          a.setAttribute('href', url);
        }
      });
    }, false);
    ver = ver || 'edge'; // Set default version in case flavor is provided but version isn't.
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/cloudinary-core/2.3.0/cloudinary-core-shrinkwrap.js');
  loadStyle('/cld-video-player' + (flavor ? '.' + flavor : '') + '.css', ver);
  loadScript('/cld-video-player' + (flavor ? '.' + flavor : '') + '.js', ver);
}());
