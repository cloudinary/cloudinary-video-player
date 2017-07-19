import videojs from 'video.js'
import { sliceProperties } from 'utils/slicing'
import { normalizeEventsParam, default as ExtendedEvents } from 'extended-events'

const DEFAULT_EVENTS = [
  'play',
  'pause',
  'ended',
  'volumechange',
  'resize',
  'error',
  'fullscreenchange',
  'start',
  'videoload',
  'percentsplayed',
  'seek',
  'playerload'
]

const EVENT_DEFAULTS = {
  percentsplayed: {
    percents: [25, 50, 75, 100]
  }
}

const DEFAULT_OPTIONS = {
  events: DEFAULT_EVENTS,
  category: 'Video',
  defaultLabel: (player) =>
    (player.cloudinary && player.cloudinary.currentPublicId()) ||
      player.currentSource().src
}

class AnalyticsPlugin {
  constructor(player, options = {}) {
    this.player = player

    options = videojs.mergeOptions(DEFAULT_OPTIONS, options)

    this._category = options.category
    this._events = normalizeEventsParam(options.events, EVENT_DEFAULTS)

    const extendedEvents = sliceProperties(this._events,
        'percentsplayed', 'timeplayed', 'pause', 'seek')

    if (extendedEvents.pause) {
      delete extendedEvents.pause
      extendedEvents.pausenoseek = {}
    }

    this._extendedEvents = new ExtendedEvents(player, { events: extendedEvents })
    this._defaultLabel = options.defaultLabel
    this._resetState()
  }

  init() {
    if (this._events.play) {
      this.player.on('play', this._play.bind(this))
    }
    if (this._events.ended) {
      this.player.on('ended', this._ended.bind(this))
    }
    if (this._events.volumechange) {
      this.player.on('volumechange', this._volumechange.bind(this))
    }
    if (this._events.resize) {
      this.player.on('resize', this._resize.bind(this))
    }
    if (this._events.error) {
      this.player.on('error', this._error.bind(this))
    }
    if (this._events.start) {
      this.player.on('playing', this._start.bind(this))
    }
    if (this._events.percentsplayed) {
      this._extendedEvents.on('percentsplayed', this._percentsplayed.bind(this))
    }
    if (this._events.timeplayed) {
      this._extendedEvents.on('timeplayed', this._timeplayed.bind(this))
    }
    if (this._events.pause) {
      this._extendedEvents.on('pausenoseek', this._pause.bind(this))
    }
    if (this._events.seek) {
      this._extendedEvents.on('seek', this._seek.bind(this))
    }
    if (this._events.playerload) {
      this._playerload()
    }
    this.player.on('loadedmetadata', this._loadedmetadata.bind(this))
  }

  track({ action, label, value = null, nonInteraction = false }) {
    const eventData = {
      eventCategory: this._category,
      eventAction: action,
      eventLabel: label || this._defaultLabel(this.player),
      eventValue: value || Math.round(this.player.currentTime()),
      nonInteraction: nonInteraction
    }

    window.ga('send', 'event', eventData)
  }

  _playerload() {
    this.track({ action: 'Player Load', label: window.location.href, nonInteraction: true })
  }

  _videoload() {
    this.track({ action: 'Video Load', nonInteraction: true })
  }

  _play() {
    this.track({ action: 'Play' })
  }

  _start() {
    if (!this._startTracked) {
      this.track({ action: 'Start' })
      this._startTracked = true
    }
  }

  _pause() {
    this.track({ action: 'Pause' })
  }

  _ended() {
    if (!this._endTracked) {
      this.track({ action: 'Ended', nonInteraction: true })
      this._endTracked = true
    }
  }

  _error() {
    this.track({ action: 'Error', nonInteraction: true })
  }

  _volumechange() {
    const value = this.player.muted() ? 0 : this.player.volume()
    this.track({ action: 'Volume Change', value })
  }

  _resize() {
    const action = `Resize - ${this.player.width()}x${this.player.height()}}`
    this.track({ action })
  }

  _fullscreenchange() {
    const action = this.player.isFullscreen() ? 'Enter Fullscreen' : 'Exit Fullscreen'
    this.track({ action })
  }

  _percentsplayed(event, data) {
    const { percent } = data
    this.track({ action: `${percent} Percents Played`, nonInteraction: true })
  }

  _timeplayed(event, data) {
    const { time } = data
    this.track({ action: `${time} Seconds Played`, value: time, nonInteraction: true })
  }

  _seek(event, data) {
    const { seekStart, seekEnd } = data
    this.track({ action: 'Seek Start', value: seekStart })
    this.track({ action: 'Seek End', value: seekEnd })
  }

  _loadedmetadata() {
    if (this.player.currentSource().src !== this._currentSource) {
      this._resetState()
      this._currentSource = this.player.currentSource().src

      if (this._events.videoload) {
        this._videoload()
      }
    }
  }

  _resetState() {
    this._currentSource = ''
    this._startTracked = false
    this._endTracked = false
  }
}

export default function(opts = {}) {
  new AnalyticsPlugin(this, opts).init()
}
