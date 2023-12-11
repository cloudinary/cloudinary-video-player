import { fontFace } from 'utils/fontFace';
import { playerClassPrefix } from 'utils/css-prefix';

import './styled-text-tracks.scss';

const styledTextTracks = (config, player) => {
  const options = {
    fontFace: config.fontFace,
    position: config.position || 'bottom',
    theme: config.theme || 'default',
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

  // Custom Styles
  if (options.style) {
    const style = document.createElement('style');
    style.innerHTML = `
      .${playerClassPrefix(player)} .vjs-text-track-display.cld-styled-text-tracks .vjs-text-track-cue > div {
        ${options.style}
      }
    `;
    player.el_.appendChild(style);
  }
};

export default styledTextTracks;
