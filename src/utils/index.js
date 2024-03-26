import * as slicing from './slicing';
import * as positioning from './positioning';
import * as string from './string';
import * as cloudinaryUtils from './cloudinary';
import * as mixin from './mixin';
import * as fontFace from './fontFace';
import * as cssPrefix from './css-prefix';
import * as normalizeAttributes from './attributes-normalizer';

const Utils = Object.assign({},
  slicing,
  positioning,
  string,
  cloudinaryUtils,
  fontFace,
  mixin,
  cssPrefix,
  normalizeAttributes
);

export default Utils;
