import EventEmitter from 'events'
import { isPlainObject } from 'utils/type-inference'
import videojs from 'video.js'

const EVENT_DEFAULTS = {
  percentsplayed: {
    percents: [25, 50, 75, 100]
  }
}

const DEFAULT_EVENTS = [
  'percentsplayed',
  'pausenoseek',
  'seek',
  'mute',
  'unmute'
]

const DEFAULT_OPTIONS = {
  events: DEFAULT_EVENTS
}

// Emits the following additional events:
// percentsplayed, timeplayed, pausenoseek, seek, mute, unmute
class ExtendedEvents extends EventEmitter {
  constructor(player, options = {}) {
    super()
    this.player = player

    options = videojs.mergeOptions(DEFAULT_OPTIONS, options)

    this.__events = normalizeEventsParam(options.events, EVENT_DEFAULTS)
    this._resetState()

    if (this.__events.percentsplayed || this.__events.timeplayed ||
      this.__events.seek || this.__events.totaltimeplayed) {

      this.player.on('timeupdate', this._timeupdate.bind(this))
    }

    if (this.__events.mute || this.__events.unmute) {
      this.player.on('volumechange', this._volumechange.bind(this))
    }

    if (this.__events.pausenoseek) {
      this.player.on('pause', this._pause.bind(this))
      this.player.on('play', this._play.bind(this))
    }

    this.player.on('loadedmetadata', this._loadedmetadata.bind(this))
  }

  _volumechange(event) {
    if (this.player.muted() && this._muteData.lastState !== 'muted') {
      this._muteData.lastState = 'muted'
      this.emit('mute', event)
    } else if (!this.player.muted() && this._muteData.lastState !== 'unmuted') {
      this._muteData.lastState = 'unmuted'
      this.emit('unmute', event)
    }
  }

  _timeupdate(event) {
    const currentTime = this.player.currentTime()
    const duration = this.player.duration()

    const emit = (type, data) => {
      data.originalType = 'timeupdate'
      this.emit(type, event, data)
    }

    if (this.__events.percentsplayed) {
      this.__events.percentsplayed.percents.forEach((percent) => {
        if (playedAtPercentage(currentTime, duration, percent) && !this._percentsTracked.includes(percent)) {
          this._percentsTracked.push(percent)
          emit('percentsplayed', { percent })
        }
      })
    }

    if (this.__events.timeplayed) {
      const timeplayed = this.__events.timeplayed
      const times = timeplayed.interval ? [Math.floor(currentTime / timeplayed.interval) * timeplayed.interval] : timeplayed.times

      times.forEach((time) => {
        if (playedAtTime(currentTime, time) && !this._timesTracked.includes(time)) {
          this._timesTracked.push(time)
          emit('timeplayed', { time })
        }
      })
    }

    if (this.__events.seek) {
      this._seekStart = this._seekEnd
      this._seekEnd = currentTime

      if (Math.abs(this._seekStart - this._seekEnd) > 1) {
        this._seeking = true
        emit('seek', { seekStart: this._seekStart, seekEnd: this._seekEnd })
      }
    }
  }

  _pause(event) {
    const currentTime = Math.round(this.player.currentTime())
    const duration = Math.round(this.player.duration())

    if (currentTime !== duration && !this._seeking) {
      this.emit('pausenoseek', event)
    }
  }

  _play() {
    this._seeking = false
  }

  _loadedmetadata() {
    if (this.player.currentSource().src !== this._currentSource) {
      this._resetPerVideoState()
      this._currentSource = this.player.currentSource().src
    }
  }

  _resetState() {
    this._muteData = { lastState: undefined }
    this._seekStart = this._seekEnd = 0
    this._seeking = false
    this._resetPerVideoState()
  }

  _resetPerVideoState() {
    this._percentsTracked = []
    this._timesTracked = []
    this._startTracked = false
    this._endTracked = false
  }
}

const normalizeEventsParam = (events, defaults) => {
  let normalized = events

  if (events.constructor.name === 'Array') {
    normalized = events.reduce((agg, item) => {
      const eventDefaults = defaults[item] || {}

      if (isPlainObject(item)) {
        agg[item.type] = Object.assign({}, eventDefaults, item)
      } else {
        agg[item] = eventDefaults
      }

      return agg
    }, {})
  }

  return normalized
}

const playedAtPercentage = (currentTime, duration, percentageCheckpoint, graceRangeSeconds = 0.5) => {
  const checkPoint = duration * percentageCheckpoint / 100
  return playedAtTime(currentTime, checkPoint, graceRangeSeconds)
}

const playedAtTime = (currentTime, checkpoint, graceRangeSeconds = 0.5) =>
  (currentTime <= checkpoint + graceRangeSeconds &&
    currentTime >= checkpoint - graceRangeSeconds)

export { normalizeEventsParam }
export default ExtendedEvents
