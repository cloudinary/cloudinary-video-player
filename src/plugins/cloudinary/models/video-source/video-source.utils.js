import { CONTAINER_MIME_TYPES, FORMAT_MAPPINGS } from './video-source.const';
import { codecShorthandTrans, codecToSrcTransformation, VIDEO_CODEC } from '../../common';
import { isPlainObject, isString } from '../../../../utils/type-inference';
import { isKeyInTransformation } from 'utils/cloudinary';
import { some } from '../../../../utils/array';

export function formatToMimeTypeAndTransformation(format) {
  const [container, codec] = format.toLowerCase().split('\/');
  let result = CONTAINER_MIME_TYPES[container];
  let transformation = null;

  if (!result) {
    result = [`video/${container}`, transformation];
  }

  if (codec) {
    transformation = codecToSrcTransformation(codec);
    result = [`${result[0]}; codecs="${codecShorthandTrans(codec)}"`, transformation];
  }

  return result;
}

export function normalizeFormat(format) {
  format = format.toLowerCase().split('\/').shift();

  let res = FORMAT_MAPPINGS[format];
  if (!res) {
    res = format.split('\/').shift();
  }

  return res;
}

const isContainCodec = (value) => value && some(Object.values(VIDEO_CODEC), (codec) => value.includes(codec));

const hasCodecSrcTrans = (transformations) => some(['video_codec', 'streaming_profile'], (key) => isKeyInTransformation(transformations, key));

export const isCodecAlreadyExist = (transformations, rawTransformation) => {
  if (!(transformations || rawTransformation)) {
    return false;
  }

  if (hasCodecSrcTrans(transformations)) {
    return true;
  }

  if (isString(rawTransformation)) {
    return isContainCodec(rawTransformation);
  }

  return some(transformations, (transformation) => {
    return some(transformation, (item) => isContainCodec(isPlainObject(item) ? item.video_codec : item));
  });
};
