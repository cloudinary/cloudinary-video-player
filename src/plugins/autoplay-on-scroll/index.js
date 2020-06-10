import { isElementInViewport } from 'utils/positioning';
import { sliceProperties } from 'utils/slicing';
import { assign } from 'utils/assign';

const defaults = {
  fraction: 0.5,
  isMuted: true
};

class AutoplayOnScrollPlugin {
  constructor(player, opts = {}) {
    opts = assign({}, defaults, opts);

    this.player = player;
    let _options = sliceProperties(opts, 'fraction');
    let _pausedByScroll = false;
    let _playedByScroll = false;
    let _pauseHandler = null;
    let _playHandler = null;

    this.init = () => {
      registerEventHandlers();
      checkViewportState();
    };

    const clearEventHandlers = () => {
      window.removeEventListener('DOMContentLoaded', checkViewportState, false);
      window.removeEventListener('load', checkViewportState, false);
      window.removeEventListener('scroll', checkViewportState, false);
      window.removeEventListener('resize', checkViewportState, false);
      this.player.off('pause', _pauseHandler);
      this.player.off('play', _playHandler);
    };

    const pause = () => {
      _pausedByScroll = true;
      _playedByScroll = false;
      this.player.pause();
    };

    const play = () => {
      _pausedByScroll = false;
      _playedByScroll = true;
      this.player.play();
    };

    const checkViewportState = () => {
      const visible = isElementInViewport(this.player.el(), { fraction: _options.fraction });

      if (visible) {
        if (this.player.paused()) {
          play();
        }
      } else if (!this.player.paused() && !this.player.activePlugins_.floatingPlayer) {
        pause();
      }
    };

    const registerEventHandlers = () => {
      // TODO: find a better replacement for 'pause' since it's being triggered
      // by 'buffering' as well.
      _pauseHandler = () => {
        if (!this.player.waiting && !_pausedByScroll) {
          clearEventHandlers();
        }
      };

      _playHandler = () => {
        if (!_playedByScroll) {
          clearEventHandlers();
        }
      };

      window.addEventListener('DOMContentLoaded', checkViewportState, false);
      window.addEventListener('load', checkViewportState, false);
      window.addEventListener('scroll', checkViewportState, false);
      window.addEventListener('resize', checkViewportState, false);
      this.player.on('pause', _pauseHandler);
      this.player.on('play', _playHandler);
    };
  }
}

export default function(opts = {}) {
  new AutoplayOnScrollPlugin(this, opts).init();
}
