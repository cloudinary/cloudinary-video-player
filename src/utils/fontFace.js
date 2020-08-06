import WebFont from 'webfontloader';

const FONT_FAMILY = 'Fira Sans';

const fontFace = (elem, options) => {
  let fontFace = options.cloudinary.fontFace;

  // Default font-face is "Fira sans"
  if (typeof fontFace === 'undefined') {
    fontFace = FONT_FAMILY;
  }

  if (fontFace && fontFace !== 'inherit') {
    WebFont.load({
      google: {
        families: [fontFace]
      }
    });
    elem.style.fontFamily = fontFace;
  } else if (fontFace === 'inherit') {
    elem.style.fontFamily = 'inherit';
  }
};

export { fontFace };
