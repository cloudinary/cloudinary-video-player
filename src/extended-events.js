import videojs from 'video.js';
import EventEmitter from 'events';
import { assign } from 'utils/assign';
import { isPlainObject } from 'utils/type-inference';
import { PLAYER_EVENT } from './utils/consts';

const EVENT_DEFAULTS = {
  percentsplayed: {
    percents: [25, 50, 75, 100]
  }
};

const DEFAULT_EVENTS = [
  PLAYER_EVENT.PERCENTS_PLAYED,
  PLAYER_EVENT.PAUSE_NO_SEEK,
  PLAYER_EVENT.SEEK,
  PLAYER_EVENT.MUTE,
  PLAYER_EVENT.UNMUTE,
  PLAYER_EVENT.QUALITY_CHANGED
];

const DEFAULT_OPTIONS = {
  events: DEFAULT_EVENTS
};

// Emits the following additional events:
// percentsplayed, timeplayed, pausenoseek, seek, mute, unmute
class ExtendedEvents extends EventEmitter {

  constructor(player, initOptions = {}) {
    super();
    this.player = player;
    const options = videojs.mergeOptions(DEFAULT_OPTIONS, initOptions);

    let _muteData = { lastState: undefined };
    let _seekStart = 0;
    let _seekEnd = 0;
    let _seeking = false;
    let _percentsTracked = [];
    let _timesTracked = [];
    let _currentSource = null;
    let _ended = false;

    const volumechange = (event) => {
      if (this.player.muted() && _muteData.lastState !== 'muted') {
        _muteData.lastState = 'muted';
        this.emit(PLAYER_EVENT.MUTE, event);
      } else if (!this.player.muted() && _muteData.lastState !== 'unmuted') {
        _muteData.lastState = 'unmuted';
        this.emit(PLAYER_EVENT.UNMUTE, event);
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
          if (playedAtPercentage(currentTime, duration, percent) && _percentsTracked.indexOf(percent) === -1) {
            _percentsTracked.push(percent);
            _emit(PLAYER_EVENT.PERCENTS_PLAYED, { percent });
          }
        });
      }

      if (this.events.timeplayed) {
        const timeplayed = this.events.timeplayed;
        const times = timeplayed.interval ? [Math.floor(currentTime / timeplayed.interval) * timeplayed.interval] : timeplayed.times;

        times.forEach((time) => {
          if (playedAtTime(currentTime, time) && _timesTracked.indexOf(time) === -1) {
            _timesTracked.push(time);
            _emit(PLAYER_EVENT.TIME_PLAYED, { time });
          }
        });
      }

      if (this.events.seek) {
        _seekStart = _seekEnd;
        _seekEnd = currentTime;

        if (Math.abs(_seekStart - _seekEnd) > 1) {
          _seeking = true;

          // should empty  _timesTracked array on seek, needed for 'timeplayed' event
          resetPerVideoState();
          _emit(PLAYER_EVENT.SEEK, { seekStart: _seekStart, seekEnd: _seekEnd });
        }
      }
    };

    const pause = (event) => {
      const currentTime = Math.round(this.player.currentTime());
      const duration = Math.round(this.player.duration());

      if (currentTime !== duration && !_seeking) {
        this.emit(PLAYER_EVENT.PAUSE_NO_SEEK, event);
      }
    };

    const play = () => {
      _seeking = false;
    };
    const replay = () => {
      if (_ended) {
        this.player.trigger('replay');
        _ended = false;
      }
    };

    const loadedmetadata = () => {
      if (this.player.currentSource().src !== _currentSource) {
        resetPerVideoState();
        _currentSource = this.player.currentSource().src;
      }
    };

    const adaptiveEvents = (event) => {
      let ee = this;
      let tracks = this.player.textTracks();
      let segmentMetadataTrack = null;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].label === 'segment-metadata') {
          segmentMetadataTrack = tracks[i];
        }

      }
      let previousResolution = null;

      if (segmentMetadataTrack) {
        segmentMetadataTrack.on('cuechange', function() {
          let activeCue = segmentMetadataTrack.activeCues[0];

          if (activeCue) {
            let currentRes = activeCue.value.resolution;
            if (previousResolution !== currentRes) {
              let data = {
                from: previousResolution,
                to: currentRes
              };
              ee.emit(PLAYER_EVENT.QUALITY_CHANGED, event, data);
            }
            previousResolution = currentRes;
          }
        });
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

    const ended = () => {
      _ended = true;
    };

    this.events = normalizeEventsParam(options.events, EVENT_DEFAULTS);
    resetState();

    this.player.on(PLAYER_EVENT.PLAY, replay.bind(this));
    this.player.on(PLAYER_EVENT.ENDED, ended.bind(this));
    if (this.events.percentsplayed || this.events.timeplayed ||
      this.events.seek || this.events.totaltimeplayed) {

      this.player.on(PLAYER_EVENT.TIME_UPDATE, timeupdate.bind(this));
    }

    if (this.events.mute || this.events.unmute) {
      this.player.on(PLAYER_EVENT.VOLUME_CHANGE, volumechange.bind(this));
    }

    if (this.events.pausenoseek) {
      this.player.on(PLAYER_EVENT.PAUSE, pause.bind(this));
      this.player.on(PLAYER_EVENT.PLAY, play.bind(this));
    }

    this.player.on(PLAYER_EVENT.LOADED_METADATA, loadedmetadata.bind(this));
    this.player.on(PLAYER_EVENT.LOADED_DATA, adaptiveEvents.bind(this));

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
