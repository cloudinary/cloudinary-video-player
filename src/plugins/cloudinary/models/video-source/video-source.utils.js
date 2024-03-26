import { CONTAINER_MIME_TYPES, FORMAT_MAPPINGS } from './video-source.const';
import { VIDEO_CODEC } from '../../common';
import { isPlainObject, isString } from '../../../../utils/type-inference';
import { isKeyInTransformation } from 'utils/cloudinary';

export function formatToMimeTypeAndTransformation(format) {
  const [container, codec] = format.toLowerCase().split('/');
  const mimetype = CONTAINER_MIME_TYPES[container] || `video/${container}`;
  let result = [mimetype];

  if (codec) {
    const transformation = { video_codec: codec };
    result = [mimetype, transformation];
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

const hasCodec = value =>
  value && Object.values(VIDEO_CODEC).some(codec => value.includes(codec));

const hasCodecSrcTrans = transformations =>
  ['video_codec', 'streaming_profile'].some(key => isKeyInTransformation(transformations, key));

export const isCodecAlreadyExist = (transformations, rawTransformation) => {
  if (!(transformations || rawTransformation)) {
    return false;
  }

  if (hasCodecSrcTrans(transformations)) {
    return true;
  }

  if (isString(rawTransformation)) {
    return hasCodec(rawTransformation);
  }

  return transformations.some && transformations.some(transformation => {
    return transformation.some && transformation.some(item =>
      hasCodec(isPlainObject(item) ? item.video_codec : item)
    );
  });
};
