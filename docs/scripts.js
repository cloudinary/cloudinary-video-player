/* eslint no-var: "off", vars-on-top: "off", curly: "off", no-extend-native: "off" */

// String.startsWith() polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
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
      } else {
        return decodeURI(results[1]) || 0;
      }
    };
  };
}
function isIPaddress(ipaddress) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipaddress);
}
// Get scripts & styles from:
// `localhost` while developing
// `unpkg.com` while demoing OR if a specific version is specified
// These SHOULD be global since they are called by some examples
var loadScript = function (source, ver) {
  var external = source.startsWith('http');
  var from =
    !ver && (external || window.location.hostname === 'localhost' || isIPaddress(window.location.hostname))
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

(function () {

  var createVersionSelector = function() {

    var parent = document.body;

    var versions = [
      { label: 'Select Player Version:' },
      { value: 'latest', label: 'Latest (Stable)' },
      { value: 'edge', label: 'Edge (Dev Only)' },
      { value: 'latest&flavor=min', label: 'Latest, minified' },
      { value: 'latest&flavor=min&dist=light', label: 'Latest, light, minified' },
      { value: 'edge&flavor=min', label: 'Edge, minified' },
      { value: 'edge&flavor=min&dist=light', label: 'Edge, light, minified' }
    ];

    // Create and append select list
    var selectList = document.createElement('select');
    selectList.id = 'version-switch';
    selectList.style.cssText = 'appearance: none;position:fixed;bottom:20px;right:20px;background:#fff;min-width:220px;height:2em;border:1px solid #ddd;';
    selectList.onchange = function (e) {
      var selected = e.target.value;
      if (selected) {
        window.location.href = window.location.origin + window.location.pathname + '?ver=' + selected;
      }
    };
    parent.appendChild(selectList);

    // Create and append the options
    for (var i = 0; i < versions.length; ++i) {
      var option = document.createElement('option');
      if (versions[i].value) {
        option.value = versions[i].value;
      } else {
        option.disabled = true;
        option.selected = true;
      }
      option.text = versions[i].label;
      selectList.appendChild(option);
    }

  };

  var initPlayerExamples = function () {
    // Allows testing of various build flavors (min/light) & versions (1.1.x)
    var search = new URLSearchParams(window.location.search);
    var ver = search.get('ver');
    var flavor = search.get('flavor');
    var dist = search.get('dist');
    if (ver || flavor) {
      // Maintain the 'ver' query param on internal links.
      window.addEventListener('load', function (e) {
        var links = document.querySelectorAll('a');
        for (var i = 0; i < links.length; ++i) {
          var a = links[i];
          if (a.hostname === location.hostname) {
            var url = a.href + '?';
            if (ver) url = url + 'ver=' + ver + '&';
            if (flavor) url = url + 'flavor=' + flavor;
            a.setAttribute('href', url);
          }
        }
      }, false);
      ver = ver || 'edge'; // Set default version in case flavor is provided but version isn't.
    }

    loadScript('https://unpkg.com/cloudinary-core/cloudinary-core-shrinkwrap.js');
    loadStyle('/cld-video-player' + (flavor ? '.' + flavor : '') + '.css', ver);
    loadScript('/cld-video-player' + (dist ? '.' + dist : '') + (flavor ? '.' + flavor : '') + '.js', ver);

    window.addEventListener('load', function() {

      createVersionSelector();

    }, false);

  };

  initPlayerExamples();

}());
