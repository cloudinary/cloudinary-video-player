import { fontFace } from 'utils/fontFace';
import { playerClassPrefix } from 'utils/css-prefix';

import './styled-text-tracks.scss';

const styledTextTracks = (config, player) => {
  const options = {
    theme: config.theme || 'default',
    fontFace: config.fontFace,
    fontSize: config.fontSize,
    position: config.position || 'bottom',
    offset: config.offset,
    style: config.style
  };

  // Class Names - Theme/Position
  const classNames = player.textTrackDisplay.el().classList;
  classNames.forEach(className => {
    // Remove previously added theme/position classes
    if (className.startsWith('cld-styled-text-tracks')) {
      classNames.remove(className);
    }
  });
  classNames.add('cld-styled-text-tracks');
  classNames.add(`cld-styled-text-tracks-theme-${options.theme}`);
  options.position.split('-').forEach(position => {
    classNames.add(`cld-styled-text-tracks-position-${position}`);
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

  // Custom offset
  if (options.offset) {
    applyImportantStyle(
      options.offset,
      '.vjs-text-track-display.cld-styled-text-tracks .vjs-text-track-cue');
  }

  // Custom font-size
  if (options.fontSize) {
    applyImportantStyle(
      { 'font-size': options.fontSize },
      '.vjs-text-track-display.cld-styled-text-tracks .vjs-text-track-cue > div');
  }

  // Custom styles
  if (options.style) {
    applyImportantStyle(
      options.style,
      '.vjs-text-track-display.cld-styled-text-tracks .vjs-text-track-cue > div');
  }

};

export default styledTextTracks;
