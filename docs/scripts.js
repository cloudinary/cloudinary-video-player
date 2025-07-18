/* eslint no-var: "off", vars-on-top: "off", curly: "off", no-extend-native: "off" */

// true on /localhost or /anything.local
var isLocal = window.location.hostname === 'localhost' || window.location.hostname.substring(window.location.hostname.lastIndexOf('.', window.location.hostname.lastIndexOf('.')) + 1) === 'local';

// true if testing in an IP page URL
var isIpAddress = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(window.location.hostname);

var isNetlify = window.location.hostname.includes('cld-video-player.netlify.app');

var cdnPrefix = function (source, ver) {
  var external = source && source.startsWith('http');
  var previewBuild = ver && ver.startsWith('http');

  if (previewBuild) {
    return ver;
  }

  if (!ver && (external || isLocal || isIpAddress)) {
    return '';
  }

  if (!ver && isNetlify) {
    return '../dist';
  }

  return 'https://cdn.jsdelivr.net/npm/cloudinary-video-player@' + (ver || 'edge') + '/dist';
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

  var versions = [
    { label: 'Select Player Version:' },
    { value: 'ver=latest', label: 'Stable (Latest)' },
    { value: 'ver=latest&min=true', label: 'Stable, Minified' },
    { value: 'ver=edge', label: 'Edge (Next Stable)' },
    { value: 'ver=edge&min=true', label: 'Edge, Minified' },
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

    // Create and append the options
    versions.forEach(function (version) {
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
        a.setAttribute('href', url);
      }
    });
  }

  function initPlayerExamples() {
    loadStyle('/cld-video-player' + (min ? '.min' : '') + '.css', ver);
    loadScript('/cld-video-player' + (min ? '.min' : '') + '.js', ver);

    window.addEventListener('load', function () {

      createVersionSelector();

      if (ver || min) {
        updatePageAnchors();
      }
    }, false);
  }

}());
