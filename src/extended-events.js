import EventEmitter from 'events';
import { isPlainObject } from 'utils/type-inference';
import videojs from 'video.js';
import assign from 'utils/assign';

const EVENT_DEFAULTS = {
  percentsplayed: {
    percents: [25, 50, 75, 100]
  }
};

const DEFAULT_EVENTS = [
  'percentsplayed',
  'pausenoseek',
  'seek',
  'mute',
  'unmute'
];

const DEFAULT_OPTIONS = {
  events: DEFAULT_EVENTS
};

// Emits the following additional events:
// percentsplayed, timeplayed, pausenoseek, seek, mute, unmute
class ExtendedEvents extends EventEmitter {
  constructor(player, options = {}) {
    super();
    this.player = player;
    options = videojs.mergeOptions(DEFAULT_OPTIONS, options);

    let _muteData = { lastState: undefined };
    let _seekStart = 0;
    let _seekEnd = 0;
    let _seeking = false;
    let _percentsTracked = [];
    let _timesTracked = [];
    let _currentSource = null;

    const volumechange = (event) => {
      if (this.player.muted() && _muteData.lastState !== 'muted') {
        _muteData.lastState = 'muted';
        this.emit('mute', event);
      } else if (!this.player.muted() && _muteData.lastState !== 'unmuted') {
        _muteData.lastState = 'unmuted';
        this.emit('unmute', event);
      }
    };

    const timeupdate = (event) => {
      const currentTime = this.player.currentTime();
      const duration = this.player.duration();

      const _emit = (type, data) => {
        data.originalType = 'timeupdate';
        this.emit(type, event, data);
      };

      if (this.events.percentsplayed) {
        this.events.percentsplayed.percents.forEach((percent) => {
          if (playedAtPercentage(currentTime, duration, percent) && !_percentsTracked.includes(percent)) {
            _percentsTracked.push(percent);
            _emit('percentsplayed', { percent });
          }
        });
      }

      if (this.events.timeplayed) {
        const timeplayed = this.events.timeplayed;
        const times = timeplayed.interval ? [Math.floor(currentTime / timeplayed.interval) * timeplayed.interval] : timeplayed.times;

        times.forEach((time) => {
          if (playedAtTime(currentTime, time) && !_timesTracked.includes(time)) {
            _timesTracked.push(time);
            _emit('timeplayed', { time });
          }
        });
      }

      if (this.events.seek) {
        _seekStart = _seekEnd;
        _seekEnd = currentTime;

        if (Math.abs(_seekStart - _seekEnd) > 1) {
          _seeking = true;
          _emit('seek', { seekStart: _seekStart, seekEnd: _seekEnd });
        }
      }
    };

    const pause = (event) => {
      const currentTime = Math.round(this.player.currentTime());
      const duration = Math.round(this.player.duration());

      if (currentTime !== duration && !_seeking) {
        this.emit('pausenoseek', event);
      }
    };

    const play = () => {
      _seeking = false;
    };

    const loadedmetadata = () => {
      if (this.player.currentSource().src !== _currentSource) {
        resetPerVideoState();
        _currentSource = this.player.currentSource().src;
      }
    };

    const resetState = () => {
      _muteData = { lastState: undefined };
      _seekStart = _seekEnd = 0;
      _seeking = false;
      resetPerVideoState();
    };

    const resetPerVideoState = () => {
      _percentsTracked = [];
      _timesTracked = [];
    };

    this.events = normalizeEventsParam(options.events, EVENT_DEFAULTS);
    resetState();

    if (this.events.percentsplayed || this.events.timeplayed ||
      this.events.seek || this.events.totaltimeplayed) {

      this.player.on('timeupdate', timeupdate.bind(this));
    }

    if (this.events.mute || this.events.unmute) {
      this.player.on('volumechange', volumechange.bind(this));
    }

    if (this.events.pausenoseek) {
      this.player.on('pause', pause.bind(this));
      this.player.on('play', play.bind(this));
    }

    this.player.on('loadedmetadata', loadedmetadata.bind(this));
  }
}

const normalizeEventsParam = (events, defaults) => {
  let normalized = events;

  if (events.constructor.name === 'Array') {
    normalized = events.reduce((agg, item) => {
      const eventDefaults = defaults[item] || {};

      if (isPlainObject(item)) {
        agg[item.type] = assign({}, eventDefaults, item);
      } else {
        agg[item] = eventDefaults;
      }

      return agg;
    }, {});
  }

  return normalized;
};

const playedAtPercentage = (currentTime, duration, percentageCheckpoint, graceRangeSeconds = 0.5) => {
  const checkPoint = duration * percentageCheckpoint / 100;
  return playedAtTime(currentTime, checkPoint, graceRangeSeconds);
};

const playedAtTime = (currentTime, checkpoint, graceRangeSeconds = 0.5) =>
  (currentTime <= checkpoint + graceRangeSeconds &&
    currentTime >= checkpoint - graceRangeSeconds);

export { normalizeEventsParam };
export default ExtendedEvents;
