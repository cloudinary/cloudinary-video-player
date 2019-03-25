import assign from 'utils/assign';

const colorStyles = `
  .cld-video-player {
    color: --text-color;
  }

  .cld-video-player .vjs-big-play-button {
    border-color: rgba(--text-color, 0.5);
  }

  .cld-video-player .vjs-control-bar,
  .cld-video-player .vjs-big-play-button,
  .cld-video-player .vjs-menu-button
  .vjs-menu-content {
    background-color: rgba(--base-color, 0.6);
  }

  .cld-video-player .vjs-time-tooltip,
  .cld-video-player .vjs-mouse-display:after,
  .cld-video-player .vjs-play-progress:after {
    color: --base-color;
    background-color: --text-color;
  }

  .cld-video-player .vjs-slider {
    background-color: rgba(--accent-color, 0.3);
  }

  .cld-video-player .vjs-load-progress,
  .cld-video-player .vjs-load-progress div {
    background: rgba(--accent-color, 0.2);
  }

  .cld-video-player .vjs-volume-level,
  .cld-video-player .vjs-play-progress {
    background: --accent-color;
  }

  .cld-video-player .vjs-volume-vertical {
    background-color: rgba(--base-color, 0.7);
  }

  .cld-video-player .vjs-volume-panel-horizontal .vjs-control:before {
    border-color: transparent transparent rgba(--accent-color, 0.4) transparent;
  }

  .cld-video-player .vjs-volume-panel-horizontal .vjs-volume-level:before {
    border-color: transparent transparent --accent-color transparent;
  }

  .cld-video-player .vjs-title-bar {
    color: --text-color;
    background-image: linear-gradient(--base-color, rgba(255, 255, 255, 0) 100%);
    background-image: linear-gradient(--base-color, rgba(255, 255, 255, 0) 100%);
  }

  .cld-video-player .vjs-recommendations-overlay {
    color: --text-color;
    background-color: rgba(--base-color, 0.4);
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item {
    box-shadow: 0 0.5em 1.2em 0px --base-color;
    color: --text-color;
    border: 1px solid --text-color !important;
    position: relative;
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item:active,
  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item:hover {
    border: 1px solid --accent-color !important;
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary .vjs-recommendations-overlay-item-primary-content {
    background-color: rgba(--base-color, 0.6);
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary div {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 80%);
  }

  .cld-video-player .vjs-upcoming-video {
    border: 1px solid rgba(--text-color, 0.5);
  }

  .cld-video-player .vjs-upcoming-video .vjs-upcoming-video-bar {
    background-color: rgba(--base-color, 0.6);
  }

  .cld-video-player .vjs-context-menu-ui .vjs-menu-content {
    background-color: rgba(--base-color, 0.6);
  }

  .cld-video-player .vjs-context-menu-ui .vjs-menu-content .vjs-menu-item:active,
  .cld-video-player .vjs-context-menu-ui .vjs-menu-content .vjs-menu-item:hover {
    color: --text-color;
    background-color: --accent-color;
  }

  .cld-video-player.vjs-ad-playing .vjs-progress-control .vjs-play-progress {
    background: --base-color;
  }

  .cld-video-player.cld-plw-layout {
    background-color: --base-color;
  }

  .cld-video-player .cld-plw-item-info-wrap {
    color: --text-color;
  }

  .cld-video-player .cld-plw-panel-item {
    border-color: --text-color;
  }
`;

const colorLightOverrides = `
  .cld-video-player .vjs-title-bar {
    flex-direction: row;
    justify-content: left;
    height: 3.6em;
    background: --base-color;
  }

  .cld-video-player .vjs-title-bar div {
    width: auto;
    padding: 0 inherit;
    margin: 0;
  }

  .cld-video-player .vjs-big-play-button {
    border-color: --text-color;
  }

  .cld-video-player .vjs-control-bar,
  .cld-video-player .vjs-big-play-button,
  .cld-video-player .vjs-menu-button
  .vjs-menu-content {
    background-color: --base-color;
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary .vjs-recommendations-overlay-item-primary-content {
    background-color: --base-color;
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary:active .vjs-recommendations-overlay-item-primary-content,
  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary:hover .vjs-recommendations-overlay-item-primary-content {
    color: --base-color;
    background-color: rgba(--accent-color, 0.8);
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary:active div,
  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary:hover div {
    color: --base-color;
    background-color: rgba(--accent-color, 0.8);
  }

  .cld-video-player .vjs-recommendations-overlay .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-secondary div {
    background: --base-color;
  }

  .cld-video-player .vjs-upcoming-video {
    border: 1px solid --text-color;
  }

  .cld-video-player .vjs-upcoming-video .vjs-upcoming-video-bar {
    background-color: --base-color;
  }

  .cld-video-player .vjs-context-menu-ui .vjs-menu-content {
    background-color: --base-color;
  }

  .cld-video-player .cld-plw-item-info-wrap {
    color: --text-color;
  }

  @media only screen and (max-width: 768px) {
    .cld-video-player.cld-plw-vertical .cld-plw-item-info-wrap {
      color: --accent-color;
    }
  }
`;

const defaults = {
  colors: {
    'base': '#000E1F',
    'accent': '#FF620C',
    'text': '#FFFFFF'
  },
  colorsLight: {
    'base': '#FFFFFF',
    'accent': '#0078FF',
    'text': '#0E2F5A'
  }
};

class Colors {
  constructor(player, opts = {}) {
    opts = assign({}, defaults, opts);
    this.player = player;

    this.init = () => {
      injectCSS(parseStyles(colorStyles));

      if (this.player.options_.skin === 'light') {
        injectCSS(parseStyles(colorLightOverrides));
      }
    };

    const injectCSS = (css) => {
      const style = document.createElement('style');
      style.innerHTML = css;
      document.body.appendChild(style);
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
        .replace(/.cld\-video\-player/g, '#' + this.player.id_)
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
