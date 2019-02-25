import { isElementInViewport } from 'utils/positioning';
import { sliceProperties } from 'utils/slicing';
import assign from 'utils/assign';
import './floating-player.scss';

const defaults = {
  fraction: 0.5,
  collapsedWidth: 300,
  floatTo: 'right'
};

class FloatingPlayer {
  constructor(player, opts = {}) {
    opts = assign({}, defaults, opts);

    this.player = player;
    let _options = sliceProperties(opts, 'fraction');

    let _floated = false;
    let _floater = null;

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

    const unwrap = (wrapper) => {
      const fragment = document.createDocumentFragment();
      while (wrapper.firstChild) {
        fragment.appendChild(wrapper.firstChild);
      }
      wrapper.parentNode.replaceChild(fragment, wrapper);
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
      this.player.on('pause', removeWindowEventHandlers);
      this.player.on('dispose', removeWindowEventHandlers);
    };

    const float = () => {
      const el = this.player.el();
      const elRect = el.getBoundingClientRect();

      // create floater element
      _floater = wrapInner(el);
      _floater.setAttribute('class', 'cld-video-player-floater cld-video-player-floater');
      _floater.setAttribute('style', 'position: fixed; top: ' + elRect.top + 'px; left: ' + elRect.left + 'px; right: ' + (document.documentElement.clientWidth - elRect.right) + 'px; bottom: ' + (document.documentElement.clientHeight - elRect.bottom) + 'px; width: ' + elRect.width + 'px; height: ' + elRect.height + 'px;');

      setTimeout(() => {
        _floater.classList.add('cld-video-player-floater-bottom-' + opts.floatTo);
        _floater.style.height = elRect.height / elRect.width * opts.collapsedWidth + 'px';
        _floater.style.width = opts.collapsedWidth + 'px';
      });

      _floated = true;
    };

    const unfloat = () => {
      unwrap(_floater);
      _floated = false;
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
