import { isLight } from '../../video-player.utils';
import './colors.scss';

const defaults = {
  colorsDark: {
    'base': '#000000',
    'accent': '#0D9AFF',
    'text': '#FFFFFF'
  },
  colorsLight: {
    'base': '#FFFFFF',
    'accent': '#0D9AFF',
    'text': '#000000'
  }
};

export const getDefaultPlayerColor = (options) => {
  return isLight(options) ? defaults.colorsLight : defaults.colorsDark;
};

const colorsPlugin = (player, opts = {}) => {
  const skinDefaults = getDefaultPlayerColor(player.options_);
  opts.colors = Object.assign({}, skinDefaults, opts.colors);

  // Set CSS custom properties on the player element
  const playerEl = player.el();
  
  if (opts.colors.base) {
    playerEl.style.setProperty('--cld-color-base', opts.colors.base);
  }
  
  if (opts.colors.accent) {
    playerEl.style.setProperty('--cld-color-accent', opts.colors.accent);
  }
  
  if (opts.colors.text) {
    playerEl.style.setProperty('--cld-color-text', opts.colors.text);
  }

  // Return an object with methods to update colors if needed
  return {
    updateColors: (newColors) => {
      const updatedColors = Object.assign({}, opts.colors, newColors);
      
      if (updatedColors.base) {
        playerEl.style.setProperty('--cld-color-base', updatedColors.base);
      }
      
      if (updatedColors.accent) {
        playerEl.style.setProperty('--cld-color-accent', updatedColors.accent);
      }
      
      if (updatedColors.text) {
        playerEl.style.setProperty('--cld-color-text', updatedColors.text);
      }
      
      opts.colors = updatedColors;
    },
    
    getColors: () => opts.colors
  };
};

export default colorsPlugin; 
