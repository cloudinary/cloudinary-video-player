import { fontFace } from 'utils/fontFace';
import { playerClassPrefix } from 'utils/css-prefix';

import './styled-text-tracks.scss';

const styledTextTracks = (config, player) => {
  const options = {
    theme: config.theme || 'default',
    fontFace: config.fontFace,
    fontSize: config.fontSize,
    gravity: config.gravity || 'bottom',
    box: config.box,
    style: config.style
  };

  // Class Names - Theme/Gravity
  const classNames = player.textTrackDisplay.el().classList;
  classNames.forEach(className => {
    // Remove previously added theme/gravity classes
    if (className.startsWith('cld-styled-text-tracks')) {
      classNames.remove(className);
    }
  });
  classNames.add('cld-styled-text-tracks');
  classNames.add(`cld-styled-text-tracks-theme-${options.theme}`);
  options.gravity.split('-').forEach(gravity => {
    classNames.add(`cld-styled-text-tracks-gravity-${gravity}`);
  });

  // Font
  if (options.fontFace) {
    fontFace(player.textTrackDisplay.el(), options.fontFace);
  }

  const applyImportantStyle = (style, selector) => {
    const styleEl = document.createElement('style');
    if (Object.entries(style)) {
      const css = Object.entries(style).reduce((acc, [key, value]) => {
        return acc + `${key}: ${value} !important; `;
      }, '');
      styleEl.innerHTML = `
      .${playerClassPrefix(player)} ${selector} {
          ${css}
        }
      `;
      player.el_.appendChild(styleEl);
    }
  };

  // Custom bounding box
  if (options.box) {
    const { x, y, width, height } = options.box;
    applyImportantStyle(
      {
        translate: `${x ? x : 0} ${y ? y : 0}`,
        ...(width ? { width } : undefined),
        ...(height ? { height } : undefined)
      },
      '.vjs-text-track-display.cld-styled-text-tracks'
    );
  }

  // Custom font-size
  if (options.fontSize) {
    applyImportantStyle(
      { 'font-size': options.fontSize },
      '.vjs-text-track-display.cld-styled-text-tracks .vjs-text-track-cue > div'
    );
  }

  // Custom styles
  if (options.style) {
    applyImportantStyle(
      options.style,
      '.vjs-text-track-display.cld-styled-text-tracks .vjs-text-track-cue > div'
    );
  }
};

export default styledTextTracks;
