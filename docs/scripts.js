/* eslint no-var: "off", vars-on-top: "off", curly: "off", no-extend-native: "off" */

// String.startsWith() polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

(function () {

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

  var createVersionSelector = function() {

    var parent = document.body;

    var versions = [
      { label: 'Select Player Version:' },
      { value: 'latest', label: 'Latest (Stable)' },
      { value: 'edge', label: 'Edge (Dev Only)' },
      { value: 'latest&flavor=min', label: 'Latest, minified' },
      { value: 'edge&flavor=min', label: 'Edge, minified' }
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
    versions.forEach(v => {
      var option = document.createElement('option');
      if (v.value) {
        option.value = v.value;
      } else {
        option.disabled = true;
        option.selected = true;
      }
      option.text = v.label;
      selectList.appendChild(option);
    });

  };

  var initPlayerExamples = function () {

    // Allows testing of various build flavors (min/light) & versions (1.1.x)
    var search = new URLSearchParams(window.location.search);
    var ver = search.get('ver');
    var flavor = search.get('flavor');
    if (ver || flavor) {
      // Maintain the 'ver' query param on internal links.
      window.addEventListener('load', function (e) {
        var links = document.querySelectorAll('a');
        for (var i = 0; links.length; ++i) {
          var a = links[i];
          if (a.hostname === location.hostname) {
            var url = new URL(a.href);
            if (ver) url.searchParams.set('ver', ver);
            if (flavor) url.searchParams.set('flavor', flavor);
            a.setAttribute('href', url);
          }
        }
      }, false);
      ver = ver || 'edge'; // Set default version in case flavor is provided but version isn't.
    }

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/cloudinary-core/2.3.0/cloudinary-core-shrinkwrap.js');
    loadStyle('/cld-video-player' + (flavor ? '.' + flavor : '') + '.css', ver);
    loadScript('/cld-video-player' + (flavor ? '.' + flavor : '') + '.js', ver);

    window.addEventListener('load', function() {

      createVersionSelector();

    }, false);

  };

  initPlayerExamples();

}());
