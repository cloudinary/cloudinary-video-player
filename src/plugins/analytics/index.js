import videojs from 'video.js';
import { sliceProperties } from 'utils/slicing';
import { normalizeEventsParam, default as ExtendedEvents } from 'extended-events';

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
];

const EVENT_DEFAULTS = {
  percentsplayed: {
    percents: [25, 50, 75, 100]
  }
};

const DEFAULT_OPTIONS = {
  events: DEFAULT_EVENTS,
  category: 'Video',
  defaultLabel: (player) =>
    (player.cloudinary && player.cloudinary.currentPublicId()) ||
      player.currentSource().src
};

class AnalyticsPlugin {
  constructor(player, options = {}) {
    this.player = player;

    options = videojs.mergeOptions(DEFAULT_OPTIONS, options);

    this.events = normalizeEventsParam(options.events, EVENT_DEFAULTS);

    const extendedEvents = sliceProperties(this.events, 'percentsplayed', 'timeplayed', 'pause', 'seek');
    if (extendedEvents.pause) {
      delete extendedEvents.pause;
      extendedEvents.pausenoseek = {};
    }

    const _extendedEvents = new ExtendedEvents(player, { events: extendedEvents });
    const _defaultLabel = options.defaultLabel;
    const _category = options.category;

    let _currentSource = null;
    let _startTracked = null;
    let _endTracked = null;

    this.init = () => {
      const playerload = () => {
        this.track({ action: 'Player Load', label: window.location.href, nonInteraction: true });
      };

      const videoload = () => {
        this.track({ action: 'Video Load', nonInteraction: true });
      };

      const play = () => {
        this.track({ action: 'Play' });
      };

      const start = () => {
        if (_startTracked) {
          this.track({ action: 'Start' });
          _startTracked = true;
        }
      };

      const pause = () => {
        this.track({ action: 'Pause' });
      };

      const ended = () => {
        if (!_endTracked) {
          this.track({ action: 'Ended', nonInteraction: true });
          _endTracked = true;
        }
      };

      const error = () => {
        this.track({ action: 'Error', nonInteraction: true });
      };

      const volumechange = () => {
        const value = this.player.muted() ? 0 : this.player.volume();
        this.track({ action: 'Volume Change', value });
      };

      const resize = () => {
        const action = `Resize - ${this.player.width()}x${this.player.height()}}`;
        this.track({ action });
      };

      const fullscreenchange = () => {
        const action = this.player.isFullscreen() ? 'Enter Fullscreen' : 'Exit Fullscreen';
        this.track({ action });
      };

      const percentsplayed = (event, data) => {
        const { percent } = data;
        this.track({ action: `${percent} Percents Played`, nonInteraction: true });
      };

      const timeplayed = (event, data) => {
        const { time } = data;
        this.track({ action: `${time} Seconds Played`, value: time, nonInteraction: true });
      };

      const seek = (event, data) => {
        const { seekStart, seekEnd } = data;
        this.track({ action: 'Seek Start', value: seekStart });
        this.track({ action: 'Seek End', value: seekEnd });
      };

      const loadedmetadata = () => {
        if (this.player.currentSource().src !== _currentSource) {
          resetState();
          _currentSource = this.player.currentSource().src;

          if (this.events.videoload) {
            videoload();
          }
        }
      };

      if (this.events.play) {
        this.player.on('play', play.bind(this));
      }
      if (this.events.ended) {
        this.player.on('ended', ended.bind(this));
      }
      if (this.events.volumechange) {
        this.player.on('volumechange', volumechange.bind(this));
      }
      if (this.events.resize) {
        this.player.on('resize', resize.bind(this));
      }
      if (this.events.error) {
        this.player.on('error', error.bind(this));
      }
      if (this.events.start) {
        this.player.on('playing', start.bind(this));
      }
      if (this.events.fullscreenchange) {
        this.player.on('fullscreenchange', fullscreenchange.bind(this));
      }
      if (this.events.percentsplayed) {
        _extendedEvents.on('percentsplayed', percentsplayed.bind(this));
      }
      if (this.events.timeplayed) {
        _extendedEvents.on('timeplayed', timeplayed.bind(this));
      }
      if (this.events.pause) {
        _extendedEvents.on('pausenoseek', pause.bind(this));
      }
      if (this.events.seek) {
        _extendedEvents.on('seek', seek.bind(this));
      }
      if (this.events.playerload) {
        playerload();
      }
      this.player.on('loadedmetadata', loadedmetadata.bind(this));
    };

    this.track = ({ action, label, value = null, nonInteraction = false }) => {
      const eventData = {
        eventCategory: _category,
        eventAction: action,
        eventLabel: label || _defaultLabel(this.player),
        eventValue: value || Math.round(this.player.currentTime()),
        nonInteraction: nonInteraction
      };

      window.ga('send', 'event', eventData);
    };

    const resetState = () => {
      _currentSource = '';
      _startTracked = false;
      _endTracked = false;
    };

    resetState();
  }
}

export default function(opts = {}) {
  new AnalyticsPlugin(this, opts).init();
}
