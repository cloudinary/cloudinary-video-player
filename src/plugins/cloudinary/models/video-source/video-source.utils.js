import { CONTAINER_MIME_TYPES, FORMAT_MAPPINGS } from './video-source.const';
import { codecShorthandTrans, codecToSrcTransformation } from '../../common';

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
