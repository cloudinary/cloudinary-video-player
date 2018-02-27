import VideoSource from './models/video-source';
import { isInteger } from 'utils/type-inference';

const DEFAULT_AUTO_ADVANCE = 0;
const DEFAULT_PRESENT_UPCOMING = 10;
const UPCOMING_VIDEO_TRANSITION = 1;

class Playlist {
  constructor(context, sources = [], { repeat = false, autoAdvance = false, presentUpcoming = false } = {}) {
    const _context = context;
    let _sources = [];
    let _currentIndex = null;
    let _autoAdvance = null;
    let _presentUpcoming = null;
    let _defaultRecResolverCache = {};
    let _recommendationsHandler = null;

    this.enqueue = (source, options = {}) => {
      const src = source instanceof VideoSource ? source
        : buildSource(source, options);

      _sources.push(src);

      return src;
    };

    this.currentIndex = (index) => {
      if (index === undefined) {
        return _currentIndex;
      }

      if (index >= this.length() || index < 0) {
        throw new Error('Invalid playlist index.');
      }

      _currentIndex = index;

      const current = this.currentSource();
      const itemBuilder = recommendationItemBuilder(current);

      if (!current.recommendations()) {
        current.recommendations(defaultRecommendationsResolver(current));
      }

      _context.source(current, { recommendationOptions: { disableAutoShow: true, itemBuilder } });

      const eventData = { playlist: this, current, next: this.next() };

      this.player().trigger('playlistitemchanged', eventData);

      refreshRecommendations();

      return current;
    };

    this.presentUpcoming = (delay) => {
      _presentUpcoming = _presentUpcoming || {};

      if (delay === undefined) {
        return _presentUpcoming.delay;
      }

      if (delay === true) {
        delay = DEFAULT_PRESENT_UPCOMING;
      } else if (delay === false) {
        delay = false;
      } else if (!isInteger(delay) || delay < 0) {
        throw new Error('presentUpcoming \'delay\' must be either a boolean or a positive integer.');
      }

      _presentUpcoming.delay = delay;

      setupPresentUpcoming();

      return _presentUpcoming.delay;
    };

    this.autoAdvance = (delay) => {
      _autoAdvance = _autoAdvance || {};

      if (delay === undefined) {
        return _autoAdvance.delay;
      }

      if (delay === true) {
        delay = DEFAULT_AUTO_ADVANCE;
      } else if (delay === false) {
        delay = false;
      } else if (!isInteger(delay) || delay < 0) {
        throw new Error('Auto advance \'delay\' must be either a boolean or a positive integer.');
      }

      _autoAdvance.delay = delay;

      setupAutoAdvance();

      return _autoAdvance.delay;
    };

    this.list = () => _sources;

    this.player = () => _context.player;

    this.dispose = () => {
      resetAutoAdvance();
      resetPresentUpcoming();
      resetRecommendations();
    };

    this.resetState = () => {
      this.repeat(repeat);
      this.autoAdvance(autoAdvance);
      this.presentUpcoming(presentUpcoming);
    };

    const setupAutoAdvance = () => {
      resetAutoAdvance();

      const delay = _autoAdvance.delay;

      if (delay === false) {
        return;
      }

      const trigger = () => {
        if (this.player().ended()) {
          _autoAdvance.timeout = setTimeout(() => {
            this.playNext();
          }, delay * 1000);
        }
      };

      _autoAdvance = { delay, trigger };

      _context.on('ended', _autoAdvance.trigger);
    };

    const resetAutoAdvance = () => {
      if (!_autoAdvance) {
        _autoAdvance = {};
      }

      if (_autoAdvance.timeout) {
        clearTimeout(_autoAdvance.timeout);
      }

      if (_autoAdvance.trigger) {
        _context.off('ended', _autoAdvance.trigger);
      }

      _autoAdvance.timeout = null;
      _autoAdvance.trigger = null;
    };

    const setupPresentUpcoming = () => {
      resetPresentUpcoming();

      const delay = _presentUpcoming.delay;

      if (delay === false) {
        return;
      }

      _presentUpcoming.trigger = () => {
        const currentTime = this.player().currentTime();
        const duration = this.player().duration();

        const remainingTime = duration - currentTime;

        if (remainingTime < UPCOMING_VIDEO_TRANSITION + 0.5) {
          if (_presentUpcoming.showTriggered) {
            this.player().trigger('upcomingvideohide');
            _presentUpcoming.showTriggered = false;
          }
        } else if (remainingTime <= _presentUpcoming.delay && !_presentUpcoming.showTriggered && !this.player().loop()) {
          this.player().trigger('upcomingvideoshow');
          _presentUpcoming.showTriggered = true;
        } else if (_presentUpcoming.showTriggered && (remainingTime > _presentUpcoming.delay || this.player().loop())) {
          this.player().trigger('upcomingvideohide');
          _presentUpcoming.showTriggered = false;
        }
      };

      _context.on('timeupdate', _presentUpcoming.trigger);
    };

    const resetPresentUpcoming = () => {
      this.player().trigger('upcomingvideohide');

      if (!_presentUpcoming) {
        _presentUpcoming = {};
      }

      if (_presentUpcoming.trigger) {
        _context.off('timeupdate', _presentUpcoming.trigger);
      }

      _presentUpcoming.trigger = null;
      _presentUpcoming.showTriggered = false;
    };

    const resetRecommendations = () => {
      if (_recommendationsHandler) {
        _context.off('ended', _recommendationsHandler);
      }
    };

    const refreshRecommendations = () => {
      resetRecommendations();

      _recommendationsHandler = () => {
        if (this.autoAdvance() === false && _context.autoShowRecommendations()) {
          this.player().trigger('recommendationsshow');
        }
      };

      _context.on('ended', _recommendationsHandler);
    };


    const recommendationItemBuilder = (source) => {
      const defaultResolver = _defaultRecResolverCache[source.objectId];
      if (source.recommendations() && (!defaultResolver || source.recommendations() !== defaultResolver)) {
        return;
      }

      return (source) => ({ source, action: () => this.playItem(source) });
    };

    const defaultRecommendationsResolver = (source) => {
      const defaultResolver = _defaultRecResolverCache[source.objectId];
      if (defaultResolver) {
        return defaultResolver;
      }

      _defaultRecResolverCache[source.objectId] = () => {
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

      return _defaultRecResolverCache[source.objectId];
    };

    const buildSource = (source, options = {}) => _context.buildSource(source, options);

    sources.forEach((source) => this.enqueue(source));

    this.resetState();
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
    let nextIndex = this.nextIndex();

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

    let isLast = index === this.length() - 1;

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
