/* eslint no-var: "off", vars-on-top: "off" */

// Get scripts & styles from:
// `localhost` while developing
// `unpkg.com` while demoing

var loadScript = function (source, external) {
  var script = document.createElement('script');
  var from = external || window.location.hostname === 'localhost' ? '' : 'https://unpkg.com/cloudinary-video-player@edge/dist';
  script.type = 'text/javascript';
  script.src = from + source;
  document.getElementsByTagName('head')[0].appendChild(script);
};

var loadStyle = function (source, external) {
  var style = document.createElement('link');
  var from = external || window.location.hostname === 'localhost' ? '' : 'https://unpkg.com/cloudinary-video-player@edge/dist';
  style.type = 'text/css';
  style.rel = 'stylesheet';
  style.href = from + source;
  document.getElementsByTagName('head')[0].appendChild(style);
};

(function() {

  // Allows testing of various build versions (min/light)
  var ver = new URLSearchParams(window.location.search).get('ver');
  if (ver) {
    // Maintain the 'ver' query param on internal links.
    window.addEventListener('load', function (e) {
      Array.from(document.querySelectorAll('a')).forEach(a => {
        if (a.hostname === location.hostname) {
          var url = new URL(a.href);
          url.searchParams.set('ver', ver);
          a.setAttribute('href', url);
        }
      });
    }, false);
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/cloudinary-core/2.3.0/cloudinary-core-shrinkwrap.js', true);
  loadStyle('/cld-video-player' + (ver ? '.' + ver : '') + '.css');
  loadScript('/cld-video-player' + (ver ? '.' + ver : '') + '.js');
}());
