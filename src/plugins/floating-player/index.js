import { isElementInViewport } from 'utils/positioning';
import { sliceProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import './floating-player.scss';

const defaults = {
  fraction: 0.5,
  collapsedWidth: 300,
  floatTo: 'right'
};

class FloatingPlayer {
  constructor(player, opts = {}) {
    opts = assign({}, defaults, opts);
    // Handle non left-right values.
    if (opts.floatTo && opts.floatTo !== 'left' && opts.floatTo !== 'right') {
      opts.floatTo = defaults.floatTo;
    }

    this.player = player;
    let _options = sliceProperties(opts, 'fraction');

    let _floater = null;
    let _floated = false;
    let _wrapped = false;

    this.init = () => {
      registerEventHandlers();
    };

    const wrapInner = (parent) => {
      const wrapper = document.createElement('div');
      parent.appendChild(wrapper);
      while (parent.firstChild !== wrapper) {
        wrapper.appendChild(parent.firstChild);
      }
      return wrapper;
    };

    const removeWindowEventHandlers = () => {
      window.removeEventListener('DOMContentLoaded', checkViewportState, false);
      window.removeEventListener('load', checkViewportState, false);
      window.removeEventListener('scroll', checkViewportState, false);
      window.removeEventListener('resize', checkViewportState, false);
    };

    const addWindowEventHandlers = () => {
      window.addEventListener('DOMContentLoaded', checkViewportState, false);
      window.addEventListener('load', checkViewportState, false);
      window.addEventListener('scroll', checkViewportState, false);
      window.addEventListener('resize', checkViewportState, false);
    };

    const registerEventHandlers = () => {
      this.player.on('play', checkViewportState);
      this.player.on('play', addWindowEventHandlers);
      // this.player.on('pause', removeWindowEventHandlers);
      this.player.on('dispose', removeWindowEventHandlers);
    };

    const float = () => {
      const el = this.player.el();
      const elRect = el.getBoundingClientRect();

      if (!_wrapped) {
        // Create floater element
        _floater = wrapInner(el);
        _floater.setAttribute('class', 'cld-video-player-floater cld-video-player-floater-bottom-' + opts.floatTo);
        _floater.setAttribute('style', [
          'width: ' + opts.collapsedWidth + 'px;',
          'top: ' + elRect.top + 'px;',
          'left: ' + elRect.left + 'px;',
          'right: ' + (document.documentElement.clientWidth - elRect.right) + 'px;',
          'bottom: ' + (document.documentElement.clientHeight - elRect.bottom) + 'px;'
        ].join(''));

        // Create inner element
        const inner = wrapInner(_floater);
        inner.setAttribute('class', 'cld-video-player-floater-inner');
        inner.setAttribute('style', 'padding-bottom: ' + (100 * elRect.height / elRect.width) + '%;');

        const close = document.createElement('button');
        close.setAttribute('class', 'cld-video-player-floater-close');
        close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><polygon fill-rule="evenodd" points="370 7.41 368.59 6 364 10.59 359.41 6 358 7.41 362.59 12 358 16.59 359.41 18 364 13.41 368.59 18 370 16.59 365.41 12" transform="translate(-358 -6)"/></svg>';
        close.onclick = () => {
          unfloat();
          disable();
        };
        _floater.appendChild(close);

        _wrapped = true;
      }

      setTimeout(() => {
        _floater.classList.add('cld-video-player-floating');
      });

      _floated = true;
    };

    const unfloat = () => {
      _floater.classList.remove('cld-video-player-floating');
      _floated = false;
    };

    const disable = () => {
      removeWindowEventHandlers();
      this.player.off('play', checkViewportState);
      this.player.off('play', addWindowEventHandlers);
    };

    const checkViewportState = () => {
      const visible = isElementInViewport(this.player.el(), { fraction: _options.fraction });
      if (visible) {
        if (_floated) {
          unfloat();
        }
      } else if (!_floated) {
        float();
      }
    };
  }
}

export default function(opts = {}) {
  new FloatingPlayer(this, opts).init();
}
