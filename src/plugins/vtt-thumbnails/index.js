/* eslint-disable */
import videojs from 'video.js';

import './vtt-thumbnails.scss';

// Default options for the plugin.
var defaults = {}

// Cache for image elements
var cache = {}

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
var onPlayerReady = function onPlayerReady(player, options) {
  player.addClass("vjs-vtt-thumbnails")
  player.vttThumbnails = new vttThumbnailsPlugin(player, options)
}

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
var vttThumbnails = function vttThumbnails(options) {
  var _this = this

  this.ready(function() {
    onPlayerReady(_this, videojs.mergeOptions(defaults, options))
  })
}

/**
 * VTT Thumbnails class.
 *
 * This class performs all functions related to displaying the vtt
 * thumbnails.
 */
var vttThumbnailsPlugin = (function() {
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
  function vttThumbnailsPlugin(player, options) {
    this.player = player
    this.options = options
    this.listenForDurationChange()
    this.initializeThumbnails()
    this.registeredEvents = {}
    return this
  }

  vttThumbnailsPlugin.prototype.src = function src(source) {
    this.resetPlugin()
    this.options.src = source
    this.initializeThumbnails()
  }

  vttThumbnailsPlugin.prototype.detach = function detach() {
    this.resetPlugin()
  }

  vttThumbnailsPlugin.prototype.resetPlugin = function resetPlugin() {
    this.thumbnailHolder &&
      this.thumbnailHolder.parentNode.removeChild(this.thumbnailHolder)
    this.progressBar &&
      this.progressBar.removeEventListener(
        "mouseenter",
        this.registeredEvents.progressBarMouseEnter
      )
    this.progressBar &&
      this.progressBar.removeEventListener(
        "mouseleave",
        this.registeredEvents.progressBarMouseLeave
      )
    this.progressBar &&
      this.progressBar.removeEventListener(
        "mousemove",
        this.registeredEvents.progressBarMouseMove
      )
    delete this.registeredEvents.progressBarMouseEnter
    delete this.registeredEvents.progressBarMouseLeave
    delete this.registeredEvents.progressBarMouseMove
    delete this.progressBar
    delete this.vttData
    delete this.thumbnailHolder
    delete this.lastStyle
  }

  vttThumbnailsPlugin.prototype.listenForDurationChange = function listenForDurationChange() {
    this.player.on("durationchange", function() {})
  }

  /**
   * Bootstrap the plugin.
   */

  vttThumbnailsPlugin.prototype.initializeThumbnails = function initializeThumbnails() {
    var _this2 = this

    if (!this.options.src) {
      return
    }
    var baseUrl = this.getBaseUrl()
    var url = this.getFullyQualifiedUrl(this.options.src, baseUrl)
    this.getVttFile(url).then(function(data) {
      _this2.vttData = _this2.processVtt(data)
      _this2.setupThumbnailElement()
    })
  }

  /**
   * Builds a base URL should we require one.
   *
   * @returns {string}
   */

  vttThumbnailsPlugin.prototype.getBaseUrl = function getBaseUrl() {
    return [
      window.location.protocol,
      "//",
      window.location.hostname,
      window.location.port ? ":" + window.location.port : "",
      window.location.pathname
    ]
      .join("")
      .split(/([^\/]*)$/gi)
      .shift()
  }

  /**
   * Grabs the contents of the VTT file.
   *
   * @param url
   * @returns {Promise}
   */

  vttThumbnailsPlugin.prototype.getVttFile = function getVttFile(url) {
    var _this3 = this

    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest()
      req.data = {
        resolve: resolve
      }
      req.addEventListener("load", _this3.vttFileLoaded)
      req.open("GET", url)
      req.send()
    })
  }

  /**
   * Callback for loaded VTT file.
   */

  vttThumbnailsPlugin.prototype.vttFileLoaded = function vttFileLoaded() {
    this.data.resolve(this.responseText)
  }

  vttThumbnailsPlugin.prototype.setupThumbnailElement = function setupThumbnailElement(
    data
  ) {
    var _this4 = this

    var mouseDisplay = this.player.$(".vjs-mouse-display")
    this.progressBar = this.player.$(".vjs-progress-control")
    var thumbHolder = document.createElement("div")
    thumbHolder.setAttribute("class", "vjs-vtt-thumbnail-display")
    this.progressBar.appendChild(thumbHolder)
    this.thumbnailHolder = thumbHolder
    var timeHolder = document.createElement("div")
    timeHolder.setAttribute("class", "vjs-vtt-time-display")
    this.thumbnailHolder.appendChild(timeHolder)
    this.timeHolder = timeHolder
    if (mouseDisplay) {
      mouseDisplay.classList.add("vjs-hidden")
    }
    this.registeredEvents.progressBarMouseEnter = function() {
      return _this4.onBarMouseenter()
    }
    this.registeredEvents.progressBarMouseLeave = function() {
      return _this4.onBarMouseleave()
    }
    this.progressBar.addEventListener(
      "mouseenter",
      this.registeredEvents.progressBarMouseEnter
    )
    this.progressBar.addEventListener(
      "mouseleave",
      this.registeredEvents.progressBarMouseLeave
    )
  }

  vttThumbnailsPlugin.prototype.onBarMouseenter = function onBarMouseenter() {
    var _this5 = this

    this.mouseMoveCallback = function(e) {
      _this5.onBarMousemove(e)
    }
    this.registeredEvents.progressBarMouseMove = this.mouseMoveCallback
    this.progressBar.addEventListener(
      "mousemove",
      this.registeredEvents.progressBarMouseMove
    )
    this.showThumbnailHolder()
  }

  vttThumbnailsPlugin.prototype.onBarMouseleave = function onBarMouseleave() {
    if (this.registeredEvents.progressBarMouseMove) {
      this.progressBar.removeEventListener(
        "mousemove",
        this.registeredEvents.progressBarMouseMove
      )
    }
    this.hideThumbnailHolder()
  }

  vttThumbnailsPlugin.prototype.getXCoord = function getXCoord(bar, mouseX) {
    var rect = bar.getBoundingClientRect()
    var docEl = document.documentElement
    return (
      mouseX - (rect.left + (window.pageXOffset || docEl.scrollLeft || 0))
    )
  }

  vttThumbnailsPlugin.prototype.onBarMousemove = function onBarMousemove(
    event
  ) {
    this.updateThumbnailStyle(
      videojs.dom.getPointerPosition(this.progressBar, event).x,
      this.progressBar.offsetWidth
    )
  }

  vttThumbnailsPlugin.prototype.getStyleForTime = function getStyleForTime(
    time
  ) {
    for (var i = 0; i < this.vttData.length; ++i) {
      var item = this.vttData[i]
      if (time >= item.start && time < item.end) {
        // Cache miss
        if (item.css.url && !cache[item.css.url]) {
          var image = new Image()
          image.src = item.css.url
          cache[item.css.url] = image
        }

        return item.css
      }
    }
  }

  vttThumbnailsPlugin.prototype.showThumbnailHolder = function showThumbnailHolder() {
    this.thumbnailHolder.style.opacity = "1"
  }

  vttThumbnailsPlugin.prototype.hideThumbnailHolder = function hideThumbnailHolder() {
    this.thumbnailHolder.style.opacity = "0"
  }

  vttThumbnailsPlugin.prototype.updateThumbnailStyle = function updateThumbnailStyle(
    percent,
    width
  ) {
    var duration = this.player.duration()
    var time = percent * duration
    var currentStyle = this.getStyleForTime(time)

    if (!currentStyle) {
      return this.hideThumbnailHolder()
    }

    var xPos = percent * width
    var thumbnailWidth = parseInt(currentStyle.width)
    var halfthumbnailWidth = thumbnailWidth >> 1
    var marginRight = width - (xPos + halfthumbnailWidth)
    var marginLeft = xPos - halfthumbnailWidth
    if (marginLeft > 0 && marginRight > 0) {
      this.thumbnailHolder.style.transform =
        "translateX(" + (xPos - halfthumbnailWidth) + "px)"
    } else if (marginLeft <= 0) {
      this.thumbnailHolder.style.transform = "translateX(" + 0 + "px)"
    } else if (marginRight <= 0) {
      this.thumbnailHolder.style.transform =
        "translateX(" + (width - thumbnailWidth) + "px)"
    }

    this.timeHolder.innerHTML = this.getTimestampFromSeconds(time)

    if (this.lastStyle && this.lastStyle === currentStyle) {
      return
    }
    this.lastStyle = currentStyle

    for (var style in currentStyle) {
      if (currentStyle.hasOwnProperty(style)) {
        this.thumbnailHolder.style[style] = currentStyle[style]
      }
    }
  }

  vttThumbnailsPlugin.prototype.processVtt = function processVtt(data) {
    var _this6 = this

    var processedVtts = []
    var vttDefinitions = data.split(/[\r\n][\r\n]/i)
    vttDefinitions.forEach(function(vttDef) {
      if (
        vttDef.match(
          /([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?( ?--> ?)([0-9]{2}:)?([0-9]{2}:)?[0-9]{2}(.[0-9]{3})?[\r\n]{1}.*/gi
        )
      ) {
        var vttDefSplit = vttDef.split(/[\r\n]/i)
        var vttTiming = vttDefSplit[0]
        var vttTimingSplit = vttTiming.split(/ ?--> ?/i)
        var vttTimeStart = vttTimingSplit[0]
        var vttTimeEnd = vttTimingSplit[1]
        var vttImageDef = vttDefSplit[1]
        var vttCssDef = _this6.getVttCss(vttImageDef)

        processedVtts.push({
          start: _this6.getSecondsFromTimestamp(vttTimeStart),
          end: _this6.getSecondsFromTimestamp(vttTimeEnd),
          css: vttCssDef
        })
      }
    })
    return processedVtts
  }

  vttThumbnailsPlugin.prototype.getFullyQualifiedUrl = function getFullyQualifiedUrl(
    path,
    base
  ) {
    // ToDo: remove this? also remove trim?
    if (path.indexOf("//") >= 0) {
      // We have a fully qualified path.
      return path
    }
    if (base.indexOf("//") === 0) {
      // We don't have a fully qualified path, but need to
      // be careful with trimming.
      return [base.replace(/\/$/gi, ""), this.trim(path, "/")].join("/")
    }
    if (base.indexOf("//") > 0) {
      // We don't have a fully qualified path, and should
      // trim both sides of base and path.
      return [this.trim(base, "/"), this.trim(path, "/")].join("/")
    }

    // If all else fails.
    return path
  }

  vttThumbnailsPlugin.prototype.getPropsFromDef = function getPropsFromDef(
    def
  ) {
    var imageDefSplit = def.split(/#xywh=/i)
    var imageUrl = imageDefSplit[0]
    var imageCoords = imageDefSplit[1]
    var splitCoords = imageCoords.match(/[0-9]+/gi)
    return {
      x: splitCoords[0],
      y: splitCoords[1],
      w: splitCoords[2],
      h: splitCoords[3],
      image: imageUrl
    }
  }

  vttThumbnailsPlugin.prototype.getVttCss = function getVttCss(vttImageDef) {
    var cssObj = {}

    // If there isn't a protocol, use the VTT source URL.
    var baseSplit = void 0
    if (this.options.src.indexOf("//") >= 0) {
      baseSplit = this.options.src.split(/([^\/]*)$/gi).shift()
    } else {
      baseSplit =
        this.getBaseUrl() + this.options.src.split(/([^\/]*)$/gi).shift()
    }

    vttImageDef = this.getFullyQualifiedUrl(vttImageDef, baseSplit)

    if (!vttImageDef.match(/#xywh=/i)) {
      cssObj.background = 'url("' + vttImageDef + '")'
      return cssObj
    }

    var imageProps = this.getPropsFromDef(vttImageDef)
    cssObj.background =
      'url("' +
      imageProps.image +
      '") no-repeat -' +
      imageProps.x +
      "px -" +
      imageProps.y +
      "px"
    cssObj.width = imageProps.w + "px"
    cssObj.height = imageProps.h + "px"
    cssObj.url = imageProps.image

    return cssObj
  }

  vttThumbnailsPlugin.prototype.doconstructTimestamp = function doconstructTimestamp(
    timestamp
  ) {
    var splitStampMilliseconds = timestamp.split(".")
    var timeParts = splitStampMilliseconds[0]
    var timePartsSplit = timeParts.split(":")
    return {
      milliseconds: parseInt(splitStampMilliseconds[1]) || 0,
      seconds: parseInt(timePartsSplit.pop()) || 0,
      minutes: parseInt(timePartsSplit.pop()) || 0,
      hours: parseInt(timePartsSplit.pop()) || 0
    }
  }

  vttThumbnailsPlugin.prototype.getSecondsFromTimestamp = function getSecondsFromTimestamp(
    timestamp
  ) {
    var timestampParts = this.doconstructTimestamp(timestamp)
    return parseInt(
      timestampParts.hours * (60 * 60) +
        timestampParts.minutes * 60 +
        timestampParts.seconds +
        timestampParts.milliseconds / 1000
    )
  }

  vttThumbnailsPlugin.prototype.getTimestampFromSeconds = function getTimestampFromSeconds(
    totalSeconds
  ) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.floor(totalSeconds % 60);
    if (seconds < 10) { seconds = '0' + seconds }
    return minutes + ':' + seconds;
  }

  vttThumbnailsPlugin.prototype.trim = function trim(str, charlist) {
    var whitespace = [
      " ",
      "\n",
      "\r",
      "\t",
      "\f",
      "\x0b",
      "\xa0",
      "\u2000",
      "\u2001",
      "\u2002",
      "\u2003",
      "\u2004",
      "\u2005",
      "\u2006",
      "\u2007",
      "\u2008",
      "\u2009",
      "\u200A",
      "\u200B",
      "\u2028",
      "\u2029",
      "\u3000"
    ].join("")
    var l = 0
    var i = 0
    str += ""
    if (charlist) {
      whitespace = (charlist + "").replace(/([[\]().?/*{}+$^:])/g, "$1")
    }
    l = str.length
    for (i = 0; i < l; i++) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(i)
        break
      }
    }
    l = str.length
    for (i = l - 1; i >= 0; i--) {
      if (whitespace.indexOf(str.charAt(i)) === -1) {
        str = str.substring(0, i + 1)
        break
      }
    }
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ""
  }

  return vttThumbnailsPlugin
})()

export default vttThumbnails;
