import videojs from 'video.js';
import { sliceProperties } from 'utils/slicing';
import { normalizeEventsParam, default as ExtendedEvents } from 'extended-events';
import { PLAYER_EVENT } from '../../utils/consts';

const DEFAULT_EVENTS = [
  PLAYER_EVENT.PLAY,
  PLAYER_EVENT.PAUSE,
  PLAYER_EVENT.ENDED,
  PLAYER_EVENT.VOLUME_CHANGE,
  PLAYER_EVENT.RESIZE,
  PLAYER_EVENT.ERROR,
  PLAYER_EVENT.FULL_SCREEN_CHANGE,
  PLAYER_EVENT.START,
  PLAYER_EVENT.VIDEO_LOAD,
  PLAYER_EVENT.PERCENTS_PLAYED,
  PLAYER_EVENT.SEEK,
  PLAYER_EVENT.PLAYER_LOAD
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
    (player.cloudinary && player.cloudinary.currentPublicId()) || player.currentSource().src
};

class AnalyticsPlugin {

  constructor(player, initOptions = {}) {
    this.player = player;
    this.options = videojs.mergeOptions(DEFAULT_OPTIONS, initOptions);
    this.events = normalizeEventsParam(this.options.events, EVENT_DEFAULTS);

    const extendedEvents = sliceProperties(this.events, PLAYER_EVENT.PERCENTS_PLAYED, PLAYER_EVENT.TIME_PLAYED, PLAYER_EVENT.PAUSE, PLAYER_EVENT.SEEK);

    if (extendedEvents.pause) {
      delete extendedEvents.pause;
      extendedEvents.pausenoseek = {};
    }

    this._extendedEvents = new ExtendedEvents(player, { events: extendedEvents });

    this._currentSource = null;
    this._startTracked = null;
    this._endTracked = null;

    this.resetState();
  }

  init() {
    const playerLoad = () => {
      this.track({ action: 'Player Load', label: window.location.href, nonInteraction: true });
    };

    const play = () => {
      this.track({ action: 'Play' });
    };

    const start = () => {
      if (this._startTracked) {
        this.track({ action: 'Start' });
        this._startTracked = true;
      }
    };

    const pause = () => {
      this.track({ action: 'Pause' });
    };

    const ended = () => {
      if (!this._endTracked) {
        this.track({ action: 'Ended', nonInteraction: true });
        this._endTracked = true;
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

    const percentsPlayed = (event, data) => {
      const { percent } = data;
      this.track({ action: `${percent} Percents Played`, nonInteraction: true });
    };

    const timePlayed = (event, data) => {
      const { time } = data;
      this.track({ action: `${time} Seconds Played`, value: time, nonInteraction: true });
    };

    const seek = (event, data) => {
      const { seekStart, seekEnd } = data;
      this.track({ action: 'Seek Start', value: seekStart });
      this.track({ action: 'Seek End', value: seekEnd });
    };

    const shoppableProductHover = (event, data) => {
      this.track({ action: 'productHover', label: data.productName });
    };

    const shoppableProductClick = (event, data) => {
      this.track({ action: 'productClick', label: data.productName });
    };

    const shoppableBarMax = () => {
      this.track({ action: 'shoppableBar', label: 'opened' });
    };

    const shoppableBarMin = () => {
      this.track({ action: 'shoppableBar', label: 'closed' });
    };

    const shoppableReplay = () => {
      this.track({ action: 'replay' });
    };

    const shoppableProductClickPost = (event, data) => {
      this.track({ action: 'productClickPostPlay', label: data.productName });
    };
    const shoppableProductHoverPost = (event, data) => {
      this.track({ action: 'productHoverPostPlay', label: data.productName });
    };

    if (this.events.shoppable) {
      this.player.on('productHover', shoppableProductHover.bind(this));
      this.player.on('productClick', shoppableProductClick.bind(this));
      this.player.on('productHoverPost', shoppableProductHoverPost.bind(this));
      this.player.on('productClickPost', shoppableProductClickPost.bind(this));
      this.player.on('productBarMin', shoppableBarMin.bind(this));
      this.player.on('productBarMax', shoppableBarMax.bind(this));
      this.player.on('replay', shoppableReplay.bind(this));
    }

    if (this.events.play) {
      this.player.on(PLAYER_EVENT.PLAY, play.bind(this));
    }

    if (this.events.ended) {
      this.player.on(PLAYER_EVENT.ENDED, ended.bind(this));
    }

    if (this.events.volumechange) {
      this.player.on(PLAYER_EVENT.VOLUME_CHANGE, volumechange.bind(this));
    }

    if (this.events.resize) {
      this.player.on(PLAYER_EVENT.RESIZE, resize.bind(this));
    }

    if (this.events.error) {
      this.player.on(PLAYER_EVENT.ERROR, error.bind(this));
    }

    if (this.events.start) {
      this.player.on(PLAYER_EVENT.PLAYING, start.bind(this));
    }

    if (this.events.fullscreenchange) {
      this.player.on(PLAYER_EVENT.FULL_SCREEN_CHANGE, fullscreenchange.bind(this));
    }

    if (this.events.percentsplayed) {
      this._extendedEvents.on(PLAYER_EVENT.PERCENTS_PLAYED, percentsPlayed.bind(this));
    }

    if (this.events.timeplayed) {
      this._extendedEvents.on(PLAYER_EVENT.TIME_PLAYED, timePlayed.bind(this));
    }

    if (this.events.pause) {
      this._extendedEvents.on(PLAYER_EVENT.PAUSE_NO_SEEK, pause.bind(this));
    }

    if (this.events.seek) {
      this._extendedEvents.on(PLAYER_EVENT.SEEK, seek.bind(this));
    }

    if (this.events.playerload) {
      playerLoad();
    }

    this.player.on(PLAYER_EVENT.LOADED_METADATA, this.loadedmetadata.bind(this));
  }

  track({ action, label, value = null, nonInteraction = false }) {
    const eventData = {
      eventCategory: this.options.category,
      eventAction: action,
      eventLabel: label || this.options.defaultLabel(this.player),
      eventValue: value || Math.round(this.player.currentTime()),
      nonInteraction: nonInteraction
    };

    window.ga('send', 'event', eventData);
  }

  videoload() {
    this.track({ action: 'Video Load', nonInteraction: true });
  }

  resetState() {
    this._currentSource = '';
    this._startTracked = false;
    this._endTracked = false;
  }

  loadedmetadata() {
    const src = this.player.currentSource().src;

    if (src !== this._currentSource) {
      this.resetState();
      this._currentSource = src;

      if (this.events.videoload) {
        this.videoload();
      }
    }
  }

}

export default function(opts = {}) {
  new AnalyticsPlugin(this, opts).init();
}
