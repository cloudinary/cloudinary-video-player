import { CONTAINER_MIME_TYPES, FORMAT_MAPPINGS } from './video-source.const';
import { VIDEO_CODEC } from '../../common';
import isString from 'lodash/isString';
import { isKeyInTransformation } from 'utils/cloudinary';

export function formatToMimeTypeAndTransformation(format) {
  const [container, codec] = format.toLowerCase().split('\/');
  const mimetype = CONTAINER_MIME_TYPES[container] || `video/${container}`;
  let result = [mimetype];

  if (codec) {
    const transformation = codecToSrcTransformation(codec);
    result = [`${mimetype}; codecs="${codecShorthandTrans(codec)}"`, transformation];
  }

  return result;
}

export function normalizeFormat(format) {
  format = format.toLowerCase().split('/').shift();

  let res = FORMAT_MAPPINGS[format];
  if (!res) {
    res = format.split('/').shift();
  }

  return res;
}

const strIncludesCodec = value =>
  value && Object.values(VIDEO_CODEC).some(codec => value.includes(codec));

const hasCodecTrans = transformations =>
  ['video_codec', 'streaming_profile'].some(key => isKeyInTransformation(transformations, key));

export const hasCodec = (transformations) => {
  if (!transformations) {
    return false;
  }

  if (isString(transformations)) {
    return strIncludesCodec(transformations);
  }

  if (hasCodecTrans(transformations)) {
    return true;
  }

  return !!transformations.some?.(transformation => {
    return hasCodec(transformation);
  });
};
