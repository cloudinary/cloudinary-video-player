import { CONTAINER_MIME_TYPES, FORMAT_MAPPINGS } from './video-source.const';
import { codecShorthandTrans, codecToSrcTransformation, VIDEO_CODEC } from '../../common';
import { isPlainObject, isString } from '../../../../utils/type-inference';
import { isKeyInTransformation } from 'utils/cloudinary';

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

const isContainCodec = (value) => {
  return value && Object.values(VIDEO_CODEC).some((codec) => value.includes(codec));
};

const hasCodecSrcTrans = (transformations) => isKeyInTransformation(transformations, 'video_codec') || isKeyInTransformation(transformations, 'streaming_profile');

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

  return Array.isArray(transformations) && transformations.some((transformation) => {
    const options = transformation.toOptions();

    if (Array.isArray(options && options.transformation)) {
      return options.transformation.some((item) => {
        return isContainCodec(isPlainObject(item) ? item.video_codec : item);
      });
    }

    return false;
  });
};
