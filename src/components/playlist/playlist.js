import VideoSource from 'plugins/cloudinary/models/video-source/video-source';
import { isInteger } from 'utils/type-inference';

import 'components/playlist/components/upcoming-video-overlay';
import 'components/playlist/components/playlist';

import {
  DEFAULT_AUTO_ADVANCE,
  DEFAULT_PRESENT_UPCOMING,
  UPCOMING_VIDEO_TRANSITION
} from './playlist.const';

class Playlist {

  constructor(context, sources = [], { repeat = false, autoAdvance = false, presentUpcoming = false } = {}) {
    this._context = context;
    this._sources = [];
    this._defaultRecResolverCache = {};
    this._currentIndex = null;
    this._recommendationsHandler = null;
    this._autoAdvance = null;
    this._presentUpcoming = null;

    this.resetState = () => {
      this.repeat(repeat);
      this.autoAdvance(autoAdvance);
      this.presentUpcoming(presentUpcoming);
    };

    sources.forEach((source) => this.enqueue(source));

    this.resetState();
  }

  list() {
    return this._sources;
  }

  player() {
    return this._context.player;
  }

  presentUpcoming(delay) {
    this._presentUpcoming = this._presentUpcoming || {};

    if (delay === undefined) {
      return this._presentUpcoming.delay;
    }

    if (delay === true) {
      delay = DEFAULT_PRESENT_UPCOMING;
    } else if (delay === false) {
      delay = false;
    } else if (!isInteger(delay) || delay < 0) {
      throw new Error('presentUpcoming \'delay\' must be either a boolean or a positive integer.');
    }

    this._presentUpcoming.delay = delay;

    this._setupPresentUpcoming();

    return this._presentUpcoming.delay;
  }

  autoAdvance(delay) {
    this._autoAdvance = this._autoAdvance || {};

    if (delay === undefined) {
      return this._autoAdvance.delay;
    }

    if (delay === true) {
      delay = DEFAULT_AUTO_ADVANCE;
    } else if (delay === false) {
      delay = false;
    } else if (!isInteger(delay) || delay < 0) {
      throw new Error('Auto advance \'delay\' must be either a boolean or a positive integer.');
    }

    this._autoAdvance.delay = delay;

    this._setupAutoAdvance();

    return this._autoAdvance.delay;
  }

  _setupAutoAdvance() {
    this._resetAutoAdvance();

    const delay = this._autoAdvance.delay;

    if (delay === false) {
      return;
    }

    const trigger = () => {
      if (this.player().ended()) {
        this._autoAdvance.timeout = setTimeout(() => {
          this.playNext();
        }, delay * 1000);
      }
    };

    this._autoAdvance = { delay, trigger };

    this._context.on('ended', this._autoAdvance.trigger);
  }

  dispose() {
    this._resetAutoAdvance();
    this._resetPresentUpcoming();
    this._resetRecommendations();
  }

  _resetPresentUpcoming() {
    this.player().trigger('upcomingvideohide');

    if (!this._presentUpcoming) {
      this._presentUpcoming = {};
    }

    if (this._presentUpcoming.trigger) {
      this._context.off('timeupdate', this._presentUpcoming.trigger);
    }

    this._presentUpcoming.trigger = null;
    this._presentUpcoming.showTriggered = false;
  }

  _setupPresentUpcoming() {
    this._resetPresentUpcoming();

    const delay = this._presentUpcoming.delay;

    if (delay === false) {
      return;
    }

    this._presentUpcoming.trigger = () => {
      const currentTime = this.player().currentTime();
      const duration = this.player().duration();

      const remainingTime = duration - currentTime;

      if (remainingTime < UPCOMING_VIDEO_TRANSITION + 0.5) {
        if (this._presentUpcoming.showTriggered) {
          this.player().trigger('upcomingvideohide');
          this._presentUpcoming.showTriggered = false;
        }
      } else if (remainingTime <= this._presentUpcoming.delay && !this._presentUpcoming.showTriggered && !this.player().loop()) {
        this.player().trigger('upcomingvideoshow');
        this._presentUpcoming.showTriggered = true;
      } else if (this._presentUpcoming.showTriggered && (remainingTime > this._presentUpcoming.delay || this.player().loop())) {
        this.player().trigger('upcomingvideohide');
        this._presentUpcoming.showTriggered = false;
      }
    };

    this._context.on('timeupdate', this._presentUpcoming.trigger);
  }

  _resetAutoAdvance() {
    if (!this._autoAdvance) {
      this._autoAdvance = {};
    }

    if (this._autoAdvance.timeout) {
      clearTimeout(this._autoAdvance.timeout);
    }

    if (this._autoAdvance.trigger) {
      this._context.off('ended', this._autoAdvance.trigger);
    }

    this._autoAdvance.timeout = null;
    this._autoAdvance.trigger = null;
  }

  _resetRecommendations() {
    if (this._recommendationsHandler) {
      this._context.off('ended', this._recommendationsHandler);
    }
  }

  _refreshRecommendations() {
    this._resetRecommendations();

    this._recommendationsHandler = () => {
      if (this.autoAdvance() === false && this._context.autoShowRecommendations()) {
        this.player().trigger('recommendationsshow');
      }
    };

    this._context.on('ended', this._recommendationsHandler);
  }


  _refreshTextTracks () {
    this.player().trigger('refreshTextTracks', this.currentSource().textTracks());
  }

  _recommendationItemBuilder(source) {
    const defaultResolver = this._defaultRecResolverCache[source.objectId];
    if (source.recommendations() && (!defaultResolver || source.recommendations() !== defaultResolver)) {
      return;
    }

    return (source) => ({ source, action: () => this.playItem(source) });
  }

  currentIndex(index) {
    if (index === undefined) {
      return this._currentIndex;
    }

    if (index >= this.length() || index < 0) {
      throw new Error('Invalid playlist index.');
    }

    this._currentIndex = index;

    const current = this.currentSource();

    const itemBuilder = this._recommendationItemBuilder(current);

    if (!current.recommendations()) {
      current.recommendations(this._defaultRecommendationsResolver(current));
    }

    this._context.source(current, { recommendationOptions: { disableAutoShow: true, itemBuilder } });

    const eventData = { playlist: this, current, next: this.next() };

    this.player().trigger('playlistitemchanged', eventData);

    this._refreshRecommendations();

    this._refreshTextTracks();

    return current;
  }

  _defaultRecommendationsResolver(source) {
    const defaultResolver = this._defaultRecResolverCache[source.objectId];
    if (defaultResolver) {
      return defaultResolver;
    }

    this._defaultRecResolverCache[source.objectId] = () => {
      let index = this.list().indexOf(source);
      const items = [];

      const numOfItems = Math.min(4, this.length() - 1);

      while (items.length < numOfItems) {
        index = this.nextIndex(index);
        if (index === -1) {
          break;
        }

        const source = this.list()[index];
        items.push(source);
      }

      return items;
    };

    return this._defaultRecResolverCache[source.objectId];
  }

  buildSource(source, options = {}) {
    return this._context.buildSource(source, options);
  }

  enqueue(source, options = {}) {
    const src = source instanceof VideoSource ? source : this.buildSource(source, options);

    this._sources.push(src);

    return src;
  }


  playItem(item) {
    let index = this.list().indexOf(item);

    if (index === -1) {
      throw new Error('Invalid playlist item.');
    }

    this.playAtIndex(index);
  }

  playAtIndex(index) {
    this.currentIndex(index);
    this.player().play();

    return this.currentSource();
  }

  currentSource() {
    return this.list()[this.currentIndex()];
  }

  removeAt(index) {
    if (index >= this.length() || index < 0) {
      throw new Error('Invalid playlist index.');
    }

    this._sources.splice(index, 1);

    return this;
  }

  repeat(repeat) {
    if (repeat === undefined) {
      return this._repeat;
    }

    this._repeat = !!repeat;

    return this._repeat;
  }

  first() {
    return this.list()[0];
  }

  last() {
    return this.list()[this.length() - 1];
  }

  next() {
    const nextIndex = this.nextIndex();

    if (nextIndex === -1) {
      return null;
    }

    return this.list()[nextIndex];
  }

  nextIndex(index) {
    index = index !== undefined ? index : this.currentIndex();

    if (index >= this.length() || index < 0) {
      throw new Error('Invalid playlist index.');
    }

    const isLast = index === this.length() - 1;

    let nextIndex = index + 1;

    if (isLast) {
      if (this.repeat()) {
        nextIndex = 0;
      } else {
        return -1;
      }
    }

    return nextIndex;
  }

  previousIndex() {
    if (this.isFirst()) {
      return -1;
    }

    return this.currentIndex() - 1;
  }

  playFirst() {
    return this.playAtIndex(0);
  }

  playLast() {
    const lastIndex = this.list().length - 1;
    return this.playAtIndex(lastIndex);
  }

  isLast() {
    return this.currentIndex() >= this.length() - 1;
  }

  isFirst() {
    return this.currentIndex() === 0;
  }

  length() {
    return this.list().length;
  }

  playNext() {
    let nextIndex = this.nextIndex();

    if (nextIndex === -1) {
      return null;
    }

    return this.playAtIndex(nextIndex);
  }

  playPrevious() {
    let previousIndex = this.previousIndex();

    if (previousIndex === -1) {
      return null;
    }

    return this.playAtIndex(previousIndex);
  }
}

export default Playlist;
