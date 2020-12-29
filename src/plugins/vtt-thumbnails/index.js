import videojs from 'video.js';
import Promise from 'promise-polyfill';

import './vtt-thumbnails.scss';

// Default options for the plugin.
let defaults = {};

// Cache for image elements
let cache = {};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-vtt-thumbnails');
  player.vttThumbnails = new VttThumbnailsPlugin(player, options);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function vttThumbnails
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const vttThumbnails = function vttThumbnails(options) {
  let _this = this;

  this.ready(function () {
    onPlayerReady(_this, videojs.mergeOptions(defaults, options));
  });
};

/**
 * VTT Thumbnails class.
 *
 * This class performs all functions related to displaying the vtt
 * thumbnails.
 */
const VttThumbnailsPlugin = (function () {

  /**
   * Plugin class constructor, called by videojs on
   * ready event.
   *
   * @function  constructor
   * @param    {Player} player
   *           A Video.js player object.
   *
   * @param    {Object} [options={}]
   *           A plain object containing options for the plugin.
   */
  function VttThumbnailsPlugin(player, options) {
    this.player = player;
    this.options = options;
    this.listenForDurationChange();
    this.initializeThumbnails();
    this.registeredEvents = {};
    return this;
  }

  VttThumbnailsPlugin.prototype.src = function src(source) {
    this.resetPlugin();
    this.options.src = source;
    this.initializeThumbnails();
  };

  VttThumbnailsPlugin.prototype.detach = function detach() {
    this.resetPlugin();
  };

  VttThumbnailsPlugin.prototype.resetPlugin = function resetPlugin() {
    if (this.thumbnailHolder) {
      this.thumbnailHolder.parentNode.removeChild(this.thumbnailHolder);
    }
    if (this.progressBar) {
      this.progressBar.removeEventListener(
        'mouseenter',
        this.registeredEvents.progressBarMouseEnter
      );
      this.progressBar.removeEventListener(
        'mouseleave',
        this.registeredEvents.progressBarMouseLeave
      );
      this.progressBar.removeEventListener(
        'mousemove',
        this.registeredEvents.progressBarMouseMove
      );
    }
    delete this.registeredEvents.progressBarMouseEnter;
    delete this.registeredEvents.progressBarMouseLeave;
    delete this.registeredEvents.progressBarMouseMove;
    delete this.progressBar;
    delete this.vttData;
    delete this.thumbnailHolder;
    delete this.lastStyle;
  };

  VttThumbnailsPlugin.prototype.listenForDurationChange = function listenForDurationChange() {
    this.player.on('durationchange', function () {
      // ToDo
    });
  };

  /**
   * Bootstrap the plugin.
   */

  VttThumbnailsPlugin.prototype.initializeThumbnails = function initializeThumbnails() {
    let _this2 = this;

    if (!this.options.src) {
      return;
    }
    let baseUrl = this.getBaseUrl();
    let url = this.getFullyQualifiedUrl(this.options.src, baseUrl);

    this.getVttFile(url).then(function (data) {
      _this2.vttData = _this2.processVtt(data);
      _this2.setupThumbnailElement();
    });
  };

  /**
   * Builds a base URL should we require one.
   *
   * @returns {string}
   */

  VttThumbnailsPlugin.prototype.getBaseUrl = function getBaseUrl() {
    return [
      window.location.protocol,
      '//',
      window.location.hostname,
      window.location.port ? ':' + window.location.port : '',
      window.location.pathname
    ]
      .join('')
      .split(/([^\/]*)$/gi)
      .shift();
  };

  /**
   * Grabs the contents of the VTT file.
   *
   * @param url
   * @returns {Promise}
   */

  VttThumbnailsPlugin.prototype.getVttFile = function getVttFile(url) {
    let _this3 = this;

    return new Promise(function (resolve) {
      let req = new XMLHttpRequest();
      req.data = {
        resolve: resolve
      };
      req.addEventListener('load', _this3.vttFileLoaded);
      req.open('GET', url);
      req.send();
    });
  };

  /**
   * Callback for loaded VTT file.
   */

  VttThumbnailsPlugin.prototype.vttFileLoaded = function vttFileLoaded() {
    this.data.resolve(this.responseText);
  };

  VttThumbnailsPlugin.prototype.setupThumbnailElement = function setupThumbnailElement() {
    let _this4 = this;

    let mouseDisplay = this.player.$('.vjs-mouse-display');
    this.progressBar = this.player.$('.vjs-progress-control');
    let thumbHolder = document.createElement('div');
    thumbHolder.setAttribute('class', 'vjs-vtt-thumbnail-display');
    this.progressBar.appendChild(thumbHolder);
    this.thumbnailHolder = thumbHolder;
    let timeHolder = document.createElement('div');
    timeHolder.setAttribute('class', 'vjs-vtt-time-display');
    this.thumbnailHolder.appendChild(timeHolder);
    this.timeHolder = timeHolder;
    if (mouseDisplay) {
      mouseDisplay.classList.add('vjs-hidden');
    }
    this.registeredEvents.progressBarMouseEnter = function () {
      return _this4.onBarMouseenter();
    };
    this.registeredEvents.progressBarMouseLeave = function () {
      return _this4.onBarMouseleave();
    };
    this.progressBar.addEventListener(
      'mouseenter',
      this.registeredEvents.progressBarMouseEnter
    );
    this.progressBar.addEventListener(
      'mouseleave',
      this.registeredEvents.progressBarMouseLeave
    );
  };

  VttThumbnailsPlugin.prototype.onBarMouseenter = function onBarMouseenter() {
    let _this5 = this;

    if (this.progressBar.offsetWidth < 400) {
      // Don't show in small players
      return;
    }

    this.mouseMoveCallback = function (e) {
      _this5.onBarMousemove(e);
    };
    this.registeredEvents.progressBarMouseMove = this.mouseMoveCallback;
    this.progressBar.addEventListener(
      'mousemove',
      this.registeredEvents.progressBarMouseMove
    );
    this.showThumbnailHolder();
  };

  VttThumbnailsPlugin.prototype.onBarMouseleave = function onBarMouseleave() {
    if (this.registeredEvents.progressBarMouseMove) {
      this.progressBar.removeEventListener(
        'mousemove',
        this.registeredEvents.progressBarMouseMove
      );
    }
    this.hideThumbnailHolder();
  };

  VttThumbnailsPlugin.prototype.getXCoord = function getXCoord(bar, mouseX) {
    let rect = bar.getBoundingClientRect();
    let docEl = document.documentElement;
    return (
      mouseX - (rect.left + (window.pageXOffset || docEl.scrollLeft || 0))
    );
  };

  VttThumbnailsPlugin.prototype.onBarMousemove = function onBarMousemove(
    event
  ) {
    this.updateThumbnailStyle(
      videojs.dom.getPointerPosition(this.progressBar, event).x,
      this.progressBar.offsetWidth
    );
  };

  VttThumbnailsPlugin.prototype.getStyleForTime = function getStyleForTime(
    time
  ) {
    for (let i = 0; i < this.vttData.length; ++i) {
      let item = this.vttData[i];
      if (time >= item.start && time < item.end) {
        // Cache miss
        if (item.css.url && !cache[item.css.url]) {
          let image = new Image();
          image.src = item.css.url;
          cache[item.css.url] = image;
        }

        return item.css;
      }
    }
  };

  VttThumbnailsPlugin.prototype.showThumbnailHolder = function showThumbnailHolder() {
    this.thumbnailHolder.style.opacity = '1';
  };

  VttThumbnailsPlugin.prototype.hideThumbnailHolder = function hideThumbnailHolder() {
    this.thumbnailHolder.style.opacity = '0';
  };

  VttThumbnailsPlugin.prototype.updateThumbnailStyle = function updateThumbnailStyle(
    percent,
    width
  ) {
    let duration = this.player.duration();
    let time = percent * duration;
    let currentStyle = this.getStyleForTime(time);

    if (!currentStyle) {
      return this.hideThumbnailHolder();
    }

    let xPos = percent * width;
    let thumbnailWidth = parseInt(currentStyle.width, 10);
    let halfthumbnailWidth = thumbnailWidth / 2;
    let marginRight = width - (xPos + halfthumbnailWidth);
    let marginLeft = xPos - halfthumbnailWidth;
    if (marginLeft > 0 && marginRight > 0) {
      this.thumbnailHolder.style.transform =
        'translateX(' + (xPos - halfthumbnailWidth) + 'px)';
    } else if (marginLeft <= 0) {
      this.thumbnailHolder.style.transform = 'translateX(' + 0 + 'px)';
    } else if (marginRight <= 0) {
      this.thumbnailHolder.style.transform =
        'translateX(' + (width - thumbnailWidth) + 'px)';
    }

    this.timeHolder.innerHTML = this.getTimestampFromSeconds(time);

    if (this.lastStyle && this.lastStyle === currentStyle) {
      return;
    }
    this.lastStyle = currentStyle;

    for (let style in currentStyle) {
      if (Object.prototype.hasOwnProperty.call(currentStyle, style)) {
        this.thumbnailHolder.style[style] = currentStyle[style];
      }
    }
  };

  VttThumbnailsPlugin.prototype.processVtt = function processVtt(data) {
    let _this6 = this;

    let processedVtts = [];
    let vttDefinitions = data.split(/[\r\n][\r\n]/i);
    vttDefinitions.forEach(function (vttDef) {
      if (
        vttDef.match(
          /([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?( ?--> ?)([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?[\r\n]{1}.*/gi
        )
      ) {
        let vttDefSplit = vttDef.split(/[\r\n]/i);
        let vttTiming = vttDefSplit[0];
        let vttTimingSplit = vttTiming.split(/ ?--> ?/i);
        let vttTimeStart = vttTimingSplit[0];
        let vttTimeEnd = vttTimingSplit[1];

        let vttImageFullPath = vttDefSplit[1];
        let vttImageDef = vttImageFullPath.split('\/').pop();
        let vttCssDef = _this6.getVttCss(vttImageDef);

        processedVtts.push({
          start: _this6.getSecondsFromTimestamp(vttTimeStart),
          end: _this6.getSecondsFromTimestamp(vttTimeEnd),
          css: vttCssDef
        });
      }
    });
    return processedVtts;
  };

  VttThumbnailsPlugin.prototype.getFullyQualifiedUrl = function getFullyQualifiedUrl(
    path,
    base
  ) {
    // ToDo: remove this? also remove trim?
    if (path.indexOf('//') >= 0) {
      // We have a fully qualified path.
      return path;
    } else if (base.indexOf('//') === 0) {
      // We don't have a fully qualified path, but need to
      // be careful with trimming.
      return [base.replace(/\/$/gi, ''), this.trim(path, '/')].join('/');
    } else if (base.indexOf('//') > 0) {
      // We don't have a fully qualified path, and should
      // trim both sides of base and path.
      return [this.trim(base, '/'), this.trim(path, '/')].join('/');
    }

    // If all else fails.
    return path;
  };

  VttThumbnailsPlugin.prototype.getPropsFromDef = function getPropsFromDef(
    def
  ) {
    let imageDefSplit = def.split(/#xywh=/i);
    let imageUrl = imageDefSplit[0];
    let imageCoords = imageDefSplit[1];
    let splitCoords = imageCoords.match(/[0-9]+/gi);
    return {
      x: splitCoords[0],
      y: splitCoords[1],
      w: splitCoords[2],
      h: splitCoords[3],
      image: imageUrl
    };
  };

  VttThumbnailsPlugin.prototype.getVttCss = function getVttCss(vttImageDef) {
    let cssObj = {};

    // If there isn't a protocol, use the VTT source URL.
    let baseSplit = '';
    if (this.options.src.indexOf('//') >= 0) {
      baseSplit = this.options.src.split(/([^\/]*)$/gi).shift();
    } else {
      baseSplit =
        this.getBaseUrl() + this.options.src.split(/([^\/]*)$/gi).shift();
    }

    vttImageDef = this.getFullyQualifiedUrl(vttImageDef, baseSplit);

    if (!vttImageDef.match(/#xywh=/i)) {
      cssObj.background = 'url("' + vttImageDef + '")';
      return cssObj;
    }

    let imageProps = this.getPropsFromDef(vttImageDef);
    cssObj.background =
      'url("' +
      imageProps.image +
      '") no-repeat -' +
      imageProps.x +
      'px -' +
      imageProps.y +
      'px';
    cssObj.width = imageProps.w + 'px';
    cssObj.height = imageProps.h + 'px';
    cssObj.url = imageProps.image;

    return cssObj;
  };

  VttThumbnailsPlugin.prototype.doconstructTimestamp = function doconstructTimestamp(
    timestamp
  ) {
    let splitStampMilliseconds = timestamp.split('.');
    let timeParts = splitStampMilliseconds[0];
    let timePartsSplit = timeParts.split(':');
    return {
      milliseconds: parseInt(splitStampMilliseconds[1], 10) || 0,
      seconds: parseInt(timePartsSplit.pop(), 10) || 0,
      minutes: parseInt(timePartsSplit.pop(), 10) || 0,
      hours: parseInt(timePartsSplit.pop(), 10) || 0
    };
  };

  VttThumbnailsPlugin.prototype.getSecondsFromTimestamp = function getSecondsFromTimestamp(
    timestamp
  ) {
    let timestampParts = this.doconstructTimestamp(timestamp);
    return parseInt(
      timestampParts.hours * (60 * 60) +
      timestampParts.minutes * 60 +
      timestampParts.seconds +
      timestampParts.milliseconds / 1000
      , 10);
  };

  VttThumbnailsPlugin.prototype.getTimestampFromSeconds = function getTimestampFromSeconds(
    totalSeconds
  ) {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  };

  VttThumbnailsPlugin.prototype.trim = function trim(str, charlist) {
    let whitespace = [
      ' ',
      '\n',
      '\r',
      '\t',
      '\f',
      '\x0b',
      '\xa0',
      '\u2000',
      '\u2001',
      '\u2002',
      '\u2003',
      '\u2004',
      '\u2005',
      '\u2006',
      '\u2007',
      '\u2008',
      '\u2009',
      '\u200A',
      '\u200B',
      '\u2028',
      '\u2029',
      '\u3000'
    ].join('');
    let l = 0;
    let i = 0;
    str += '';
    if (charlist) {
      whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1');
    }
    l = str.length;
    for (i = 0; i < l; i++) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(i);
        break;
      }
    }
    l = str.length;
    for (i = l - 1; i >= 0; i--) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(0, i + 1);
        break;
      }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
  };

  return VttThumbnailsPlugin;
}());

export default vttThumbnails;
