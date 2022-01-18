import videojs from 'video.js';
import { isElementInViewport } from 'utils/positioning';
import { sliceProperties } from 'utils/slicing';
import { assign } from 'utils/assign';
import './floating-player.scss';
import { FLOATING_TO } from '../../video-player.const';
import { addEventListener } from '../../utils/dom';
import { PLAYER_EVENT } from '../../utils/consts';

const defaults = {
  fraction: 0.5,
  collapsedWidth: 300,
  floatTo: 'right'
};

function FloatingPlayer(player, iniOpts = {}) {
  const self = this;

  self.player = player;
  const el = self.player.el();

  const opts = assign({}, defaults, iniOpts);
  // Handle non left-right values.
  if (opts.floatTo && opts.floatTo !== FLOATING_TO.LEFT && opts.floatTo !== FLOATING_TO.RIGHT) {
    opts.floatTo = defaults.floatTo;
  }

  const FLOATING_CLASS_NAME = 'cld-video-player-floating';
  let _options = sliceProperties(opts, 'fraction');
  let _floater = null;
  let _isFloated = false;
  let _isFloaterPositioned = false;
  let _eventsDestroyers = [];

  self.init = () => {
    registerEventHandlers();

    if (typeof this.player.ima === 'object') {
      creatFloaterElement();
    }
  };

  const innerWrapper = (parent) => {
    const wrapper = document.createElement('div');
    parent.appendChild(wrapper);
    while (parent.firstChild !== wrapper) {
      wrapper.appendChild(parent.firstChild);
    }

    return wrapper;
  };

  const removeWindowEventHandlers = () => {
    _eventsDestroyers.forEach((destroyer) => destroyer());
  };

  const addWindowEventHandlers = () => {
    _eventsDestroyers = [
      addEventListener(window, 'DOMContentLoaded', checkViewportState, false),
      addEventListener(window, 'load', checkViewportState, false),
      addEventListener(window, 'scroll', checkViewportState, false),
      addEventListener(window, 'resize', checkViewportState, false)
    ];
  };

  const registerEventHandlers = () => {
    self.player.on(PLAYER_EVENT.PLAY, checkViewportState);
    self.player.on(PLAYER_EVENT.PLAY, addWindowEventHandlers);
    self.player.on(PLAYER_EVENT.DISPOSE, removeWindowEventHandlers);
  };

  const getCloseButton = () => {
    const close = videojs.dom.createEl('button', {
      className: 'cld-video-player-floater-close vjs-icon-close'
    });

    close.onclick = () => {
      unFloat();
      disable();
    };

    return close;
  };

  const positionFloater = () => {
    const elRect = el.getBoundingClientRect();
    _floater.setAttribute('class', `cld-video-player-floater cld-video-player-floater-bottom-${opts.floatTo}`);

    _floater.setAttribute('style', [
      `width: ${opts.collapsedWidth}px;`,
      `top: ${elRect.top}px;`,
      `left: ${elRect.left}px;`,
      `right: ${(document.documentElement.clientWidth - elRect.right)}px;`,
      `bottom: ${(document.documentElement.clientHeight - elRect.bottom)}px;`
    ].join(''));

    _isFloaterPositioned = true;
  };

  const creatFloaterElement = () => {
    const elRect = el.getBoundingClientRect();
    _floater = innerWrapper(el);

    const inner = innerWrapper(_floater);
    inner.setAttribute('class', 'cld-video-player-floater-inner');
    inner.setAttribute('style', `padding-bottom: ${(100 * elRect.height / elRect.width)}%;`);

    _floater.appendChild(getCloseButton());
  };

  const setAdSize = () => {
    if (this.player.ima && this.player.ima.adsActive) {
      const imaIframe = self.player.ima.adContainerDiv.querySelector('iframe');

      console.log(_isFloated)

      imaIframe.width = `${_isFloated ? _floater.clientWidth : el.clientWidth}`;
      imaIframe.height = `${_isFloated ? _floater.clientHeight : el.clientHeight}`;
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
      _floater.classList.add(FLOATING_CLASS_NAME);
      setAdSize();
    });
  };

  const unFloat = () => {
    _floater.classList.remove(FLOATING_CLASS_NAME);
    _isFloated = false;
    setAdSize();
  };

  const disable = () => {
    removeWindowEventHandlers();
    this.player.off(PLAYER_EVENT.PLAY, checkViewportState);
    this.player.off(PLAYER_EVENT.PLAY, addWindowEventHandlers);
  };

  const checkViewportState = () => {
    const visible = isElementInViewport(self.player.el(), { fraction: _options.fraction });
    if (visible) {
      if (_isFloated) {
        unFloat();
      }
    } else if (!_isFloated) {
      float();
    }
  };
}

export default function(opts = {}) {
  new FloatingPlayer(this, opts).init();
}
