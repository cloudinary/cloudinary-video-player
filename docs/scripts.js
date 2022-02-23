/* eslint no-var: "off", vars-on-top: "off", curly: "off", no-extend-native: "off" */

// String.startsWith() polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

// URLSearchParams.get() polyfill
if (!window.URLSearchParams) {
  window.URLSearchParams = window.URLSearchParams || function (searchString) {
    var self = this;
    self.searchString = searchString;
    self.get = function (name) {
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);

      if (results === null) {
        return null;
      }

      return decodeURI(results[1]) || 0;
    };
  };
}

// true on /localhost or /anything.local
var isLocal = window.location.hostname === 'localhost' || window.location.hostname.substring(window.location.hostname.lastIndexOf('.', window.location.hostname.lastIndexOf('.')) + 1) === 'local';

// true if testing in an IP page URL
var isIpAddress = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(window.location.hostname);

var cdnPrefix = function (source, ver) {
  var external = source.startsWith('http');

  if (!ver && (external || isLocal || isIpAddress)) {
    return '';
  }

  return 'https://unpkg.com/cloudinary-video-player@' + (ver || 'edge') + '/dist';
};

// Get scripts & styles from:
// `localhost` while developing (localhost/ip address/.local domain)
// `unpkg.com` while demoing OR if a specific version is specified
// These MUST be global since they are called by some examples
var loadScript = function (source, ver) {
  var prefix = cdnPrefix(source, ver);
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = prefix + source;
  script.async = false;
  document.getElementsByTagName('head')[0].appendChild(script);
};

var loadStyle = function (source, ver) {
  var prefix = cdnPrefix(source, ver);
  var style = document.createElement('link');
  style.type = 'text/css';
  style.rel = 'stylesheet';
  style.href = prefix + source;
  document.getElementsByTagName('head')[0].appendChild(style);
};

(function () {

  // Allows testing of various build flavors (min/light) & versions (1.1.x)
  var search = new URLSearchParams(window.location.search);
  var ver = search.get('ver');
  var min = search.get('min');
  var light = search.get('light');

  var versions = [
    { label: 'Select Player Version:' },
    { value: 'ver=latest', label: 'Stable (Latest)' },
    { value: 'ver=latest&min=true', label: 'Stable, Minified' },
    { value: 'ver=latest&light=true', label: 'Stable, Light' },
    { value: 'ver=latest&min=true&light=true', label: 'Stable, Light, Minified' },
    { value: 'ver=edge', label: 'Edge (Next Stable)' },
    { value: 'ver=edge&min=true', label: 'Edge, Minified' },
    { value: 'ver=edge&light=true', label: 'Edge, Light' },
    { value: 'ver=edge&min=true&light=true', label: 'Edge, Light, Minified' }
  ];

  initPlayerExamples();

  function createVersionSelector() {
    // Create and append select list
    var selectList = document.createElement('select');
    selectList.id = 'version-switch';
    selectList.style.cssText = 'appearance: none;position:fixed;bottom:20px;right:20px;background:#fff;min-width:220px;height:2em;border:1px solid #ddd;padding:0 1em;';
    selectList.onchange = function (e) {
      var selected = e.target.value;
      if (selected) {
        window.location.href = window.location.origin + window.location.pathname + '?' + selected;
      }
    };
    document.body.appendChild(selectList);

    // Current flavor
    var current = 'ver=' + (ver || !isLocal && 'edge');
    if (min) current = current + '&min=' + min;
    if (light) current = current + '&light=' + light;

    // Create and append the options
    versions.forEach(function (version){
      var option = document.createElement('option');
      option.text = version.label;

      if (version.value) {
        option.value = version.value;
        // Find if this is the flavor currently in use
        if (option.value === current) {
          option.selected = true;
          option.text = 'Testing: ' + option.text;
        }
      } else {
        // 'Select Player Version:'
        option.disabled = true;
        option.selected = true;
      }

      selectList.appendChild(option);
    });
  }

  function updatePageAnchors() {
    // Maintain the 'ver' query param on internal links.
    document.querySelectorAll('a').forEach(function (a) {
      if (a.hostname === location.hostname) {
        var url = a.href + '?';
        if (ver) url = url + 'ver=' + ver + '&';
        if (min) url = url + 'min=' + min + '&';
        if (light) url = url + 'light=' + light;
        a.setAttribute('href', url);
      }
    });
  }

  function initPlayerExamples() {
    loadStyle('/cld-video-player' + (light ? '.light' : '') + (min ? '.min' : '') + '.css', ver);
    loadScript('/cld-video-player' + (light ? '.light' : '') + (min ? '.min' : '') + '.js', ver);

    window.addEventListener('load', function () {

      createVersionSelector();

      if (ver || min || light) {
        updatePageAnchors();
      }
    }, false);
  }

}());
