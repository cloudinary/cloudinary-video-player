import WebFont from 'webfontloader';

const FONT_FAMILY = 'Inter';

const fontFace = (elem, fontFace) => {
  // Default font-face is "Inter"
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
