import videojs from 'video.js'
import * as plugins from 'plugins'
import * as Utils from 'utils'
import defaults from 'config/defaults'
import Eventable from 'mixins/eventable'
import ExtendedEvents from 'extended-events'
import normalizeAttributes from './attributes-normalizer'

const SOURCE_PARAMS = ['cloudinaryConfig', 'transformation',
  'sourceTypes', 'sourceTransformation', 'posterOptions']
const PLAYER_PARAMS = SOURCE_PARAMS.concat(['publicId', 'source', 'autoplayMode',
  'playedEventPercents', 'playedEventTimes', 'analytics'])
const VALID_SKINS = ['blue', 'yellow', 'orange', 'white']
const CLASS_PREFIX = 'cld-video-player'

const registerPlugin = videojs.plugin

// Register all plugins
Object.keys(plugins).forEach((key) => {
  registerPlugin(key, plugins[key])
})

const normalizeAutoplay = (options) => {
  const autoplayMode = options.autoplayMode
  if (autoplayMode) {
    switch (autoplayMode) {
      case 'always':
        options.autoplay = true
        break
      case 'on-scroll':
      case 'never':
      default:
        options.autoplay = false
    }
  }
}

const resolveVideoElement = (elem) => {
  if (typeof elem === 'string') {
    let id = elem

    // Adjust for jQuery ID syntax
    if (id.indexOf('#') === 0) {
      id = id.slice(1)
    }

    elem = document.querySelector(`#${id}`)

    if (!elem) {
      throw new Error(`Could not find element with id ${id}`)
    }
  }

  if (!elem.tagName) {
    throw new Error('Must specify either an element or an element id.')
  } else if (elem.tagName !== 'VIDEO') {
    throw new Error('Element is not a video tag.')
  }

  return elem
}

const extractOptions = (elem, options) => {
  const elemOptions = normalizeAttributes(elem)

  // Default options < Markup options < Player options
  options = Object.assign({}, defaults, elemOptions, options)

  // In case of 'autoplay on scroll', we need to make sure normal HTML5 autoplay is off
  normalizeAutoplay(options)

  // VideoPlayer specific options
  const playerOptions = Utils.sliceAndUnsetProperties(options, ...PLAYER_PARAMS)

  // Cloudinary plugin specific options
  playerOptions.cloudinary = Utils.sliceAndUnsetProperties(playerOptions, ...SOURCE_PARAMS)

  // Allow explicitly passing options to videojs using the `videojs` namespace, in order
  // to avoid param name conflicts:
  // VideoPlayer.new({ controls: true, videojs: { controls: false })
  if (options.videojs) {
    Object.assign(options, options.videojs)
    delete options.videojs
  }

  // video.js specific options
  const videojsOptions = options

  return { playerOptions, videojsOptions }
}

const cssClassFromSkin = (skin) => `${CLASS_PREFIX}-skin-${skin}`

class VideoPlayer extends Utils.mixin(Eventable) {
  constructor(elem, options, ready) {
    super()

    elem = resolveVideoElement(elem)
    options = extractOptions(elem, options)

    this._options = options.playerOptions
    this._vjs_options = options.videojsOptions

    // Make sure to add 'video-js' class before creating videojs instance
    Utils.addClass(elem, 'video-js')

    this.videojs = videojs(elem, this._vjs_options)
    this._initPlugins()

    this.videojs.ready(() => {
      this._onReady()

      if (ready) {
        ready(this)
      }
    })
  }

  static all(selector, ...args) {
    const nodeList = document.querySelectorAll(selector)
    const players = []

    for (let i = 0; i < nodeList.length; i++) {
      players.push(new VideoPlayer(nodeList[i], ...args))
    }

    return players
  }

  cloudinaryConfig(config) {
    return this.videojs.cloudinary.cloudinaryConfig(config)
  }

  currentPublicId() {
    return this.videojs.cloudinary.currentPublicId()
  }

  currentSourceUrl() {
    return this.videojs.currentSource().src
  }

  currentPoster() {
    return this.videojs.cloudinary.currentPoster()
  }

  source(publicId, options = {}) {
    return this.videojs.cloudinary.source(publicId, options)
  }

  posterOptions(options) {
    return this.videojs.cloudinary.posterOptions(options)
  }

  playlist(sources, options = {}) {
    return this.videojs.cloudinary.playlist(sources, options)
  }

  playlistByTag(tag, options = {}) {
    return this.videojs.cloudinary.playlistByTag(tag, options)
  }

  sourcesByTag(tag, options = {}) {
    return this.videojs.cloudinary.sourcesByTag(tag, options)
  }

  play() {
    return this.videojs.play()
  }

  stop() {
    this.pause()
    this.currentTime(0)
    return this
  }

  playPrevious() {
    this.playlist().playPrevious()
    return this
  }

  playNext() {
    this.playlist().playNext()
    return this
  }

  transformation(trans) {
    return this.videojs.cloudinary.transformation(trans)
  }

  sourceTypes(types) {
    return this.videojs.cloudinary.sourceTypes(types)
  }

  sourceTransformation(trans) {
    return this.videojs.cloudinary.sourceTransformation(trans)
  }

  duration() {
    return this.videojs.duration()
  }

  height(dimension) {
    if (!dimension) {
      return this.videojs.height()
    }

    this.videojs.height(dimension)

    return this
  }

  width(dimension) {
    if (!dimension) {
      return this.videojs.width()
    }

    this.videojs.width(dimension)

    return this
  }

  volume(volume) {
    if (!volume) {
      return this.videojs.volume()
    }

    this.videojs.volume(volume)

    return this
  }

  mute() {
    if (!this.isMuted()) {
      this.videojs.muted(true)
    }

    return this
  }

  unmute() {
    if (this.isMuted()) {
      this.videojs.muted(false)
    }

    return this
  }

  isMuted() {
    return this.videojs.muted()
  }

  pause() {
    this.videojs.pause()

    return this
  }

  currentTime(offsetSeconds) {
    if (!offsetSeconds && offsetSeconds !== 0) {
      return this.videojs.currentTime()
    }

    this.videojs.currentTime(offsetSeconds)

    return this
  }

  maximize() {
    if (!this.isMaximized()) {
      this.videojs.requestFullscreen()
    }

    return this
  }

  exitMaximize() {
    if (this.isMaximized()) {
      this.videojs.exitFullscreen()
    }

    return this
  }

  isMaximized() {
    return this.videojs.isFullscreen()
  }

  dispose() {
    this.videojs.dispose()
  }

  controls(bool) {
    if (bool === undefined) {
      return this.videojs.controls()
    }

    this.videojs.controls(bool)

    return this
  }

  loop(bool) {
    if (bool === undefined) {
      return this.videojs.loop()
    }

    this.videojs.controls(bool)

    return this
  }

  el() {
    return this.videojs.el()
  }

  _onReady() {
    this._setExtendedEvents()
    this._setCssClasses()

    // Load first video (mainly to support video tag 'source' and 'public-id' attributes)
    const source = this._options.source || this._options.publicId
    if (source) {
      this.source(source)
    }
  }

  _setExtendedEvents() {
    const events = []
    if (this._options.playedEventPercents) {
      const percentsplayed = { type: 'percentsplayed', percents: this._options.playedEventPercents }
      events.push(percentsplayed)
    }

    if (this._options.playedEventTimes) {
      const timeplayed = { type: 'timeplayed', times: this._options.playedEventTimes }
      events.push(timeplayed)
    }

    events.push(...['seek', 'mute', 'unmute'])

    this._extendedEvents = new ExtendedEvents(this.videojs, { events })

    const normalizedEvents = this._extendedEvents.__events

    Object.keys(normalizedEvents).forEach((_event) => {
      const handler = (event, data) => {
        this.videojs.trigger({ type: _event, eventData: data })
      }
      this._extendedEvents.on(_event, handler)
    })
  }

  _setCssClasses() {
    this.videojs.addClass(CLASS_PREFIX)

    const currentSkin = VALID_SKINS.find((s) => this.videojs.hasClass(cssClassFromSkin(s)))

    if (!currentSkin) {
      this.videojs.addClass(cssClassFromSkin(defaults.skin))
    }
  }

  _initPlugins() {
    this._initAutoplay()
    this._initContextMenu()
    this._initPerSrcBehaviors()
    this._initPlaylist()
    this._initCloudinary()
    this._initAnalytics()
  }

  _initAutoplay() {
    const autoplayMode = this._options.autoplayMode

    if (autoplayMode === 'on-scroll') {
      this.videojs.autoplayOnScroll()
    }
  }

  _initContextMenu() {
    this.videojs.contextMenu(defaults.contextMenu)
  }

  _initPerSrcBehaviors() {
    this.videojs.perSourceBehaviors()
  }

  _initPlaylist() {
    this.videojs.playlist()
  }

  _initCloudinary() {
    const opts = this._options.cloudinary
    opts.chainTarget = this

    this.videojs.cloudinary(this._options.cloudinary)
  }

  _initAnalytics() {
    const analyticsOpts = this._options.analytics

    if (analyticsOpts) {
      const opts = typeof analyticsOpts === 'object' ? analyticsOpts : {}
      this.videojs.analytics(opts)
    }
  }
}

export default VideoPlayer
