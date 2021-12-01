import videojs from 'video.js';
import './upcoming-video-overlay.scss';
import { PLAYER_EVENT } from '../../../utils/consts';

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;

const Component = videojs.getComponent('Component');
const ClickableComponent = videojs.getComponent('ClickableComponent');

class UpcomingVideoOverlay extends ClickableComponent {

  static DISABLE_TRANSITION_CLASS = 'disable-transition';
  static VJS_UPCOMING_VIDEO_SHOW = 'vjs-upcoming-video-show';

  constructor(player, ...args) {
    super(player, ...args);

    this._setEvents(player);
  }

  _setEvents(player) {
    player.on(PLAYER_EVENT.UP_COMING_VIDEO_SHOW, this._show);
    player.on(PLAYER_EVENT.UP_COMING_VIDEO_HIDE, this._hide);
    player.on(PLAYER_EVENT.PLAYLIST_ITEM_CHANGED, this._onPlaylistItemChange);
  }

  _hide = () => {
    this.removeClass(UpcomingVideoOverlay.VJS_UPCOMING_VIDEO_SHOW);
  }

  _disableTransition(block) {
    this.addClass(UpcomingVideoOverlay.DISABLE_TRANSITION_CLASS);
    block();
    this.removeClass(UpcomingVideoOverlay.DISABLE_TRANSITION_CLASS);
  }

  _onPlaylistItemChange = (_, event) => {
    this._hide();
    this._disableTransition(() => {
      if (event.next) {
        this.setItem(event.next);
      }
    });
  }

  _show = () => {
    const ima = this.player().ima;
    const adsManager = ima === 'object' && ima.getAdsManager();

    if (adsManager) {
      if (!adsManager.getCurrentAd() || adsManager.getCurrentAd().isLinear()) {
        this.addClass(UpcomingVideoOverlay.VJS_UPCOMING_VIDEO_SHOW);
      }
    } else {
      this.addClass(UpcomingVideoOverlay.VJS_UPCOMING_VIDEO_SHOW);
    }
  }

  setTitle(source) {
    const title = this.getChild('upcomingVideoOverlayContent')
      .getChild('upcomingVideoOverlayBar')
      .getChild('upcomingVideoOverlayTitle');

    title.setContent(source.info().title || source.publicId());
  }

  setItem(source) {
    this._source = source;

    const maxWidth = parseInt(window.getComputedStyle(this.el(), null).getPropertyValue('max-width'), 10);
    const maxHeight = Math.round(maxWidth * (9 / 16.0));

    const transformation = { crop: 'pad', background: 'auto:predominant', width: maxWidth, height: maxHeight };
    const content = this.getChild('upcomingVideoOverlayContent');

    this.setTitle(source);

    content.el().style.backgroundImage = `url(${this._source.poster().url({ transformation })})`;
  }

  handleClick() {
    super.handleClick(event);

    this.player().cloudinary.playlist().playNext();
  }

  createEl() {
    return super.createEl('div', {
      className: 'vjs-upcoming-video'
    });
  }
}

class UpcomingVideoOverlayContent extends Component {
  createEl() {
    // Content wraps image and bar
    return super.createEl('div', {
      className: 'aspect-ratio-content'
    });
  }
}

class UpcomingVideoOverlayTitle extends Component {

  setContent(title) {
    this._contentSpan.innerText = title;
  }

  createEl() {
    const el = super.createEl('div', {
      className: 'vjs-control vjs-upcoming-video-title'
    });

    const container = dom.createEl('div', {
      className: 'vjs-upcoming-video-title-display',
      innerHTML: '<span class="vjs-control-text">Next up</span>Next up: '
    });

    this._contentSpan = dom.createEl('span', {
      className: 'vjs-upcoming-video-title-display-label'
    });

    container.appendChild(this._contentSpan);

    el.appendChild(container);

    return el;
  }
}

class UpcomingVideoOverlayBar extends Component {

  createEl() {
    return super.createEl('div', {
      className: 'vjs-upcoming-video-bar'
    });
  }
}

UpcomingVideoOverlay.prototype.options_ = { children: ['upcomingVideoOverlayContent'] };
videojs.registerComponent('upcomingVideoOverlay', UpcomingVideoOverlay);

UpcomingVideoOverlayContent.prototype.options_ = { children: ['upcomingVideoOverlayBar'] };
videojs.registerComponent('upcomingVideoOverlayContent', UpcomingVideoOverlayContent);

UpcomingVideoOverlayBar.prototype.options_ = { children: ['upcomingVideoOverlayTitle', 'playlistNextButton'] };
videojs.registerComponent('upcomingVideoOverlayBar', UpcomingVideoOverlayBar);

videojs.registerComponent('upcomingVideoOverlayTitle', UpcomingVideoOverlayTitle);

export default UpcomingVideoOverlay;
