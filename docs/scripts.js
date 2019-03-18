
// Get scripts & styles from:
// `localhost` while developing
// `unpkg.com` while demoing

const loadScript = function (source, external) {
  const script = document.createElement('script');
  const from = external || window.location.hostname === 'localhost' ? '' : 'https://unpkg.com/cloudinary-video-player@edge/dist';
  script.type = 'text/javascript';
  script.src = from + source;
  document.getElementsByTagName('head')[0].appendChild(script);
};

const loadStyle = function (source, external) {
  const style = document.createElement('link');
  const from = external || window.location.hostname === 'localhost' ? '' : 'https://unpkg.com/cloudinary-video-player@edge/dist';
  style.type = 'text/css';
  style.rel = 'stylesheet';
  style.href = from + source;
  document.getElementsByTagName('head')[0].appendChild(style);
};

(function() {
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/cloudinary-core/2.3.0/cloudinary-core-shrinkwrap.js', true);
  loadStyle('/cld-video-player.css');
  loadScript('/cld-video-player.js');
}());
