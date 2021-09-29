import { assign } from 'utils/assign';
import { playerClassPrefix } from 'utils/css-prefix';
import { isLight } from '../../video-player.utils';

const playerColors = `
  .PLAYER-CLASS-PREFIX {
    --color-accent: --accent-color;
    --color-base: --base-color;
    --color-text: --text-color;

    color: --text-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-time-tooltip,
  .PLAYER-CLASS-PREFIX .vjs-mouse-display:after,
  .PLAYER-CLASS-PREFIX .vjs-play-progress:after {
    color: --base-color;
    background-color: --text-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-slider {
    background-color: rgba(--accent-color, 0.3);
  }

  .PLAYER-CLASS-PREFIX .vjs-load-progress,
  .PLAYER-CLASS-PREFIX .vjs-load-progress div {
    background: rgba(--accent-color, 0.2);
  }

  .PLAYER-CLASS-PREFIX .vjs-volume-level,
  .PLAYER-CLASS-PREFIX .vjs-play-progress {
    background: --accent-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-volume-vertical {
    background-color: rgba(--base-color, 0.7);
  }

  .PLAYER-CLASS-PREFIX .vjs-volume-panel-horizontal .vjs-control:before {
    border-color: transparent transparent rgba(--accent-color, 0.4) transparent;
  }

  .PLAYER-CLASS-PREFIX .vjs-volume-panel-horizontal .vjs-volume-level:before {
    border-color: transparent transparent --accent-color transparent;
  }

  .PLAYER-CLASS-PREFIX .vjs-title-bar {
    color: --text-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay {
    color: --text-color;
    background-color: rgba(--base-color, 0.4);
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item {
    box-shadow: 0 0.5em 1.2em 0px --base-color;
    color: --text-color;
    border: 1px solid --text-color !important;
    position: relative;
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item:active,
  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item:hover {
    border: 1px solid --accent-color !important;
  }

  .PLAYER-CLASS-PREFIX .vjs-context-menu-ui .vjs-menu-content .vjs-menu-item:active,
  .PLAYER-CLASS-PREFIX .vjs-context-menu-ui .vjs-menu-content .vjs-menu-item:hover {
    color: --text-color;
    background-color: --accent-color;
  }

  .PLAYER-CLASS-PREFIX.vjs-ad-playing .vjs-progress-control .vjs-play-progress {
    background: --base-color;
  }

  .PLAYER-CLASS-PREFIX.cld-plw-layout {
    background-color: --base-color;
  }

  .PLAYER-CLASS-PREFIX .cld-plw-item-info-wrap {
    color: --text-color;
  }

  .PLAYER-CLASS-PREFIX .cld-plw-panel-item {
    border-color: --text-color;
  }

  .PLAYER-CLASS-PREFIX .cld-video-player-floater-close polygon {
    fill: --base-color;
  }

  .PLAYER-CLASS-PREFIX .cld-spbl-product-hotspot:after {
    background: --base-color;
    box-shadow: 0 0 0 4px --accent-color, 0 0 0 8px rgba(--text-color, 0.24);
  }

  .PLAYER-CLASS-PREFIX .cld-spbl-product-tooltip {
    color: --base-color;
    background: --text-color;
  }

  .PLAYER-CLASS-PREFIX .base-color-semi-bg {
    background: rgba(--base-color, 0.7);
  }

  .PLAYER-CLASS-PREFIX .text-color-semi-bg {
    background: rgba(--text-color, 0.7);
  }

  .PLAYER-CLASS-PREFIX .text-color-text {
    color: --text-color;
  }

  .PLAYER-CLASS-PREFIX .base-color-text {
    color: --base-color;
  }

  .PLAYER-CLASS-PREFIX .accent-color-text {
    color: --accent-color;
  }
`;

const darkOnlyColors = `

  .PLAYER-CLASS-PREFIX.cld-video-player-skin-dark .base-color-bg,
  .PLAYER-CLASS-PREFIX.cld-video-player-skin-dark .vjs-control-bar,
  .PLAYER-CLASS-PREFIX.cld-video-player-skin-dark .vjs-big-play-button,
  .PLAYER-CLASS-PREFIX.cld-video-player-skin-dark .vjs-menu-button
  .vjs-menu-content {
    background-color: rgba(--base-color, 0.6);
  }

  .PLAYER-CLASS-PREFIX .vjs-title-bar {
    background-image: linear-gradient(--base-color, rgba(255, 255, 255, 0) 100%);
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary .vjs-recommendations-overlay-item-primary-content {
    background-color: rgba(--base-color, 0.6);
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary div {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 80%);
  }

  .PLAYER-CLASS-PREFIX .vjs-upcoming-video {
    border: 1px solid rgba(--text-color, 0.5);
  }

  .PLAYER-CLASS-PREFIX .vjs-upcoming-video .vjs-upcoming-video-bar {
    background-color: rgba(--base-color, 0.6);
  }

  .PLAYER-CLASS-PREFIX .vjs-context-menu-ui .vjs-menu-content {
    background-color: rgba(--base-color, 0.6);
  }
`;

const lightOnlyColors = `
  .PLAYER-CLASS-PREFIX .vjs-title-bar {
    flex-direction: row;
    justify-content: left;
    height: 3.6em;
    background: --base-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-title-bar div {
    width: auto;
    padding: 0 inherit;
    margin: 0;
  }

  .PLAYER-CLASS-PREFIX.cld-video-player-skin-light .base-color-bg,
  .PLAYER-CLASS-PREFIX.cld-video-player-skin-light .vjs-control-bar,
  .PLAYER-CLASS-PREFIX.cld-video-player-skin-light .vjs-big-play-button,
  .PLAYER-CLASS-PREFIX.cld-video-player-skin-light .vjs-menu-button .vjs-menu-content {
    background-color: --base-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary .vjs-recommendations-overlay-item-primary-content {
    background-color: --base-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary:active .vjs-recommendations-overlay-item-primary-content,
  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary:hover .vjs-recommendations-overlay-item-primary-content {
    color: --base-color;
    background-color: rgba(--accent-color, 0.8);
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary:active div,
  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary:hover div {
    color: --base-color;
    background-color: rgba(--accent-color, 0.8);
  }

  .PLAYER-CLASS-PREFIX .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary div {
    background: --base-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-upcoming-video {
    border: 1px solid --text-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-upcoming-video .vjs-upcoming-video-bar {
    background-color: --base-color;
  }

  .PLAYER-CLASS-PREFIX .vjs-context-menu-ui .vjs-menu-content {
    background-color: --base-color;
  }

  .PLAYER-CLASS-PREFIX .cld-plw-item-info-wrap {
    color: --text-color;
  }

  @media only screen and (max-width: 768px) {
    .PLAYER-CLASS-PREFIX.cld-plw-vertical .cld-plw-item-info-wrap {
      color: --accent-color;
    }
  }
`;

const defaults = {
  colorsDark: {
    'base': '#000000',
    'accent': '#FF620C',
    'text': '#FFFFFF'
  },
  colorsLight: {
    'base': '#FFFFFF',
    'accent': '#0078FF',
    'text': '#0E2F5A'
  }
};

export const getDefaultPlayerColor = (options) => {
  return isLight(options) ? defaults.colorsLight : defaults.colorsDark;
};

class Colors {
  constructor(player, opts = {}) {
    this.player = player;

    const skinDefaults = getDefaultPlayerColor(this.player.options_);

    opts.colors = assign({}, skinDefaults, opts.colors);

    this.init = () => {
      injectCSS(parseStyles(playerColors));

      if (this.player.options_.skin === 'light') {
        injectCSS(parseStyles(lightOnlyColors));
      } else {
        injectCSS(parseStyles(darkOnlyColors));
      }
    };

    const injectCSS = (css) => {
      const style = document.createElement('style');
      style.innerHTML = css;
      this.player.el_.appendChild(style);
    };

    const hexToRgb = (hex) => {

      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      // '#0080C0' to '0, 128, 192'
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

      return result
        ? parseInt(result[1], 16) + ', ' +
          parseInt(result[2], 16) + ', ' +
          parseInt(result[3], 16)
        : null;
    };

    const parseStyles = (styles) => {
      const parsed = styles
        // wrapper class
        .replace(/PLAYER\-CLASS\-PREFIX/g, playerClassPrefix(this.player))
        // rgba first
        .replace(/rgba\(\-\-base\-color/g, 'rgba(' + hexToRgb(opts.colors.base))
        .replace(/rgba\(\-\-accent\-color/g, 'rgba(' + hexToRgb(opts.colors.accent))
        .replace(/rgba\(\-\-text\-color/g, 'rgba(' + hexToRgb(opts.colors.text))
        // solid colors
        .replace(/\-\-base\-color/g, opts.colors.base)
        .replace(/\-\-accent\-color/g, opts.colors.accent)
        .replace(/\-\-text\-color/g, opts.colors.text);
      return parsed;
    };

  }
}

export default function(opts = {}) {
  new Colors(this, opts).init();
}
