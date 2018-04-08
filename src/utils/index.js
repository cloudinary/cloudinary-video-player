import { Util as core } from 'cloudinary-core';
import * as slicing from './slicing';
import * as positioning from './positioning';
import * as string from './string';
import * as cloudinaryUtils from './cloudinary';
import applyWithProps from './apply-with-props';
import autobind from './autobind';
import mixin from './mixin';
import assign from './assign';
import fontFace from './fontFace';

function groupBy(collection, iteratee) {
  return collection.reduce((result, value, key) => {
    key = iteratee(value);
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
    return result;
  }, {});
}

const util = assign({},
  core,
  slicing,
  string,
  positioning,
  fontFace,
  cloudinaryUtils,
  {
    autobind,
    mixin,
    applyWithProps,
    groupBy
  });

module.exports = util;
