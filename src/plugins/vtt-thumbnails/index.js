import videojs from 'video.js';

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
  this.ready(() => {
    onPlayerReady(this, videojs.obj.merge(defaults, options));
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
    this.initializeThumbnails();
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
    delete this.vttData;
    delete this.thumbnailHolder;
    delete this.lastStyle;
  };

  /**
   * Bootstrap the plugin.
   */
  VttThumbnailsPlugin.prototype.initializeThumbnails = function initializeThumbnails() {
    if (!this.options.src) {
      return;
    }

    debugger; // eslint-disable-line
    fetch(this.options.src, {
      credentials: this.player.cloudinary.source?.().withCredentials ? 'include' : 'omit'
    })
      .then((res) => {
        return res.text();
      })
      .then((data) => {
        this.vttData = this.processVtt(data);
        this.setupThumbnailElement();
      });
  };

  VttThumbnailsPlugin.prototype.setupThumbnailElement = function setupThumbnailElement() {
    if (!this.vttData[0]) {
      return;
    }
    const mouseDisplay = this.player.$('.vjs-progress-holder .vjs-mouse-display');
    this.thumbnailHolder = this.player.$('.vjs-vtt-thumbnail-display') || videojs.dom.createEl('div', undefined, {
      class: 'vjs-vtt-thumbnail-display',
      style: `width: ${this.vttData[0].css.width}`
    });
    this.thumbnailHolder.innerHTML = '';
    this.thumbnailHolder.setAttribute('class', 'vjs-vtt-thumbnail-display');
    mouseDisplay.appendChild(this.thumbnailHolder);

    const halfThumbnailWidth = parseInt(this.vttData[0].css.width, 10) / 2;

    const updateThumbnailStyle = this.updateThumbnailStyle.bind(this);

    const mouseTimeDisplay = this.player.getDescendant([
      'controlBar',
      'progressControl',
      'seekBar',
      'mouseTimeDisplay'
    ]);
    mouseTimeDisplay.update = function (seekBarRect, seekBarPoint) {
      const time = seekBarPoint * this.player_.duration();
      const width = seekBarRect.width;

      updateThumbnailStyle(time);

      this.getChild('timeTooltip').updateTime(seekBarRect, seekBarPoint, time, () => {
        // Make sure the thumbnail doesn't exit the player
        if ((seekBarRect.width * seekBarPoint) < halfThumbnailWidth) {
          this.el_.style.left = `${halfThumbnailWidth}px`;
        } else if ((seekBarRect.width * seekBarPoint) + halfThumbnailWidth > width) {
          this.el_.style.left = `${seekBarRect.width - halfThumbnailWidth}px`;
        } else {
          this.el_.style.left = `${seekBarRect.width * seekBarPoint}px`;
        }
      });
      this.getChild('timeTooltip').write(videojs.time.formatTime(time));
    };
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

  VttThumbnailsPlugin.prototype.updateThumbnailStyle = function updateThumbnailStyle(
    time
  ) {
    let currentStyle = this.getStyleForTime(time);

    if (!currentStyle) {
      this.thumbnailHolder.style.opacity = '0';
      return;
    } else {
      this.thumbnailHolder.style.opacity = '1';
    }

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
    let thumbnailsData = [];
    let vttDefinitions = data.split(/[\r\n][\r\n]/i);
    vttDefinitions.forEach((vttDef) => {
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
        let vttCssDef = this.getVttCss(vttImageDef);

        thumbnailsData.push({
          start: this.getSecondsFromTimestamp(vttTimeStart),
          end: this.getSecondsFromTimestamp(vttTimeEnd),
          css: vttCssDef
        });
      }
    });
    return thumbnailsData;
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
    let baseSplit = this.options.src.split(/([^\/]*)$/gi).shift();

    vttImageDef = [baseSplit.trim(), vttImageDef.trim()].join('/');

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

  VttThumbnailsPlugin.prototype.getSecondsFromTimestamp = function getSecondsFromTimestamp(
    timestamp
  ) {
    const [hours, minutes, seconds] = timestamp.split(':').map(parseFloat);
    return (hours * 60 * 60) + (minutes * 60) + seconds;
  };

  return VttThumbnailsPlugin;
}());

export default vttThumbnails;
