import * as assign from './assign';
import * as slicing from './slicing';
import * as positioning from './positioning';
import * as string from './string';
import * as cloudinaryUtils from './cloudinary';
import * as applyWithProps from './apply-with-props';
import * as groupBy from './groupBy';
import * as mixin from './mixin';
import * as fontFace from './fontFace';
import * as playButton from './playButton';
import * as cssPrefix from './css-prefix';
import * as normalizeAttributes from './attributes-normalizer';

const Utils = assign.assign({},
  assign,
  slicing,
  positioning,
  string,
  cloudinaryUtils,
  fontFace,
  playButton,
  groupBy,
  applyWithProps,
  mixin,
  cssPrefix,
  normalizeAttributes
);

export default Utils;
