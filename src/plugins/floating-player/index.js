import { isElementInViewport } from 'utils/positioning';
import { sliceProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import './floating-player.scss';
import { FLOATING_TO } from '../../video-player.const';

const defaults = {
  fraction: 0.5,
  collapsedWidth: 300,
  floatTo: 'right'
};

class FloatingPlayer {

  constructor(player, opts = {}) {
    opts = assign({}, defaults, opts);
    // Handle non left-right values.
    if (opts.floatTo && opts.floatTo !== FLOATING_TO.LEFT && opts.floatTo !== FLOATING_TO.RIGHT) {
      opts.floatTo = defaults.floatTo;
    }

    this.player = player;
    const el = this.player.el();
    let _options = sliceProperties(opts, 'fraction');
    let _floater = null;
    let _isFloated = false;
    let _isFloaterPositioned = false;

    this.init = () => {
      registerEventHandlers();

      if (typeof this.player.ima === 'object') {
        creatFloaterElement();
      }
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
      this.player.on('dispose', removeWindowEventHandlers);
    };

    const positionFloater = () => {
      const elRect = el.getBoundingClientRect();
      _floater.setAttribute('class', `cld-video-player-floater cld-video-player-floater-bottom-${opts.floatTo}`);

      _floater.setAttribute('style', [
        'width: ' + opts.collapsedWidth + 'px;',
        'top: ' + elRect.top + 'px;',
        'left: ' + elRect.left + 'px;',
        'right: ' + (document.documentElement.clientWidth - elRect.right) + 'px;',
        'bottom: ' + (document.documentElement.clientHeight - elRect.bottom) + 'px;'
      ].join(''));

      _isFloaterPositioned = true;
    };

    const creatFloaterElement = () => {
      const elRect = el.getBoundingClientRect();
      _floater = wrapInner(el);

      const inner = wrapInner(_floater);
      inner.setAttribute('class', 'cld-video-player-floater-inner');
      inner.setAttribute('style', 'padding-bottom: ' + (100 * elRect.height / elRect.width) + '%;');

      const close = document.createElement('button');
      close.setAttribute('class', 'cld-video-player-floater-close');
      close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><polygon fill-rule="evenodd" points="370 7.41 368.59 6 364 10.59 359.41 6 358 7.41 362.59 12 358 16.59 359.41 18 364 13.41 368.59 18 370 16.59 365.41 12" transform="translate(-358 -6)"/></svg>';
      close.onclick = () => {
        unFloat();
        disable();
      };

      _floater.appendChild(close);
    };

    const setAdSize = () => {
      const { ima } = this.player;
      if (ima && ima.adsActive) {
        const adsManager = ima.getAdsManager();

        adsManager.resize(
          _isFloated ? _floater.clientWidth : el.clientWidth,
          _isFloated ? _floater.clientHeight : el.clientHeight
        );
      }
    };

    const float = () => {

      if (!_floater) {
        creatFloaterElement();
      }

      if (!_isFloaterPositioned) {
        positionFloater();
      }

      _isFloated = true;

      setTimeout(() => {
        _floater.classList.add('cld-video-player-floating');
        setAdSize();
      });
    };

    const unFloat = () => {
      _floater.classList.remove('cld-video-player-floating');
      _isFloated = false;
      setAdSize();
    };

    const disable = () => {
      removeWindowEventHandlers();
      this.player.off('play', checkViewportState);
      this.player.off('play', addWindowEventHandlers);
    };

    const checkViewportState = () => {
      const visible = isElementInViewport(this.player.el(), { fraction: _options.fraction });
      if (visible) {
        if (_isFloated) {
          unFloat();
        }
      } else if (!_isFloated) {
        float();
      }
    };
  }
}

export default function(opts = {}) {
  new FloatingPlayer(this, opts).init();
}
