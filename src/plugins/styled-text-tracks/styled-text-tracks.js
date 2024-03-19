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
    style: config.style,
    wordHighlightStyle: config.wordHighlightStyle
  };

  const styleEl = document.createElement('style');
  player.el_.appendChild(styleEl);

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

  const applyStyle = (style, selector) => {
    if (Object.entries(style)) {
      const css = Object.entries(style).reduce((acc, [key, value]) => {
        return acc + `${key}: ${value} !important; `;
      }, '');
      styleEl.innerHTML += `${selector} { ${css} } `;
    }
  };

  const applyWrapperStyle = (style) => {
    const selector = `
      .${playerClassPrefix(player)} .vjs-text-track-display.cld-styled-text-tracks,
      .${playerClassPrefix(player)} ::-webkit-media-text-track-display
    `;
    applyStyle(style, selector);
  };

  const applyCueStyle = (style) => {
    const selector = `
      .${playerClassPrefix(player)} .vjs-text-track-cue > div,
      .${playerClassPrefix(player)} ::cue
    `;
    applyStyle(style, selector);
  };

  // Font
  if (options.fontFace) {
    fontFace(player.textTrackDisplay.el(), options.fontFace);
    applyCueStyle({ 'font-family': options.fontFace });
  }

  // Custom bounding box
  if (options.box) {
    const { x, y, width, height } = options.box;
    applyWrapperStyle({
      translate: `${x ? x : 0} ${y ? y : 0}`,
      ...(width ? { width } : undefined),
      ...(height ? { height } : undefined)
    });
  }

  // Custom font-size
  if (options.fontSize) {
    applyCueStyle({ 'font-size': options.fontSize });
  }

  // Custom styles
  if (options.style) {
    applyCueStyle(options.style);
  }

  // Word highlight styles
  if (options.wordHighlightStyle) {
    applyStyle(
      options.wordHighlightStyle,
      `.${playerClassPrefix(player)} .cld-paced-text-tracks .vjs-text-track-cue b`
    );
    applyStyle(
      options.wordHighlightStyle,
      'video::cue(b)'
    );
  }
};

export default styledTextTracks;
