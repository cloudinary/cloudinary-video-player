import { assign } from 'utils/assign';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { isString, isPlainObject } from 'utils/type-inference';
import { URL_PATTERN } from './models/video-source/video-source.const';
import { createCloudinaryLegacyURL } from '@cloudinary/url-gen/backwards/createCloudinaryLegacyURL.cjs';
import Transformation from '@cloudinary/url-gen/backwards/transformation.cjs';
import { omit } from '../../utils/object';


const normalizeOptions = (publicId, options, { tolerateMissingId = false } = {}) => {
  if (isPlainObject(publicId)) {
    const _options = assign({}, publicId);

    publicId = sliceAndUnsetProperties(_options, 'publicId').publicId;

    if (!isString(publicId) && !tolerateMissingId) {
      throw new Error('Source is missing \'publicId\'.');
    }

    if (options) {
      options = assign({}, _options, options);
    }
  }

  return { publicId, options };
};

export const isRawUrl = (publicId) => URL_PATTERN.test(publicId);

const isSrcEqual = (source1, source2) => {
  let src1 = source1;
  let src2 = source2;

  if (typeof source1 === 'object') {
    src1 = source1.src;
  }

  if (typeof source2 === 'object') {
    src2 = source2.src;
  }

  if (/^\/\//.test(src1)) {
    src2 = src2.slice(src2.indexOf('//'));
  }
  if (/^\/\//.test(src2)) {
    src1 = src1.slice(src1.indexOf('//'));
  }

  return src1 === src2;
};

export const extendCloudinaryConfig = (currentConfig, newConfig) => Object.assign(currentConfig, newConfig);

export const getCloudinaryUrl = (publicId, transformation) => createCloudinaryLegacyURL(publicId, omit(transformation, ['chainTarget']));

const isTransformationInstance = (transformation) => transformation.constructor.name === 'Transformation' && transformation.toOptions;

const mergeTransformations = (initTransformation1, transformation2) => {
  const transformation1 = isTransformationInstance(initTransformation1) ? initTransformation1.toOptions() : initTransformation1;

  return new Transformation(transformation1).fromOptions(transformation2).toOptions();
};

const ERROR_CODE = {
  NO_SUPPORTED_MEDIA: 6,
  CUSTOM: 10,
  UNKNOWN_CUSTOMER: 11,
  RESOURCE_NOT_FOUND: 12,
  PRIVATE_RESOURCE: 13,
  UNAUTHENTICATED: 14
};

const cloudinaryErrorsConverter = ({ errorMsg, publicId, cloudName, statusCode }) => {
  const msg = 'Video cannot be played';
  let error = { code: ERROR_CODE.CUSTOM, message: `${msg}${errorMsg ? '- ' + errorMsg : ''}`, statusCode: statusCode };
  let err = errorMsg.toLowerCase();
  if (err.startsWith('unknown customer')) {
    error.code = ERROR_CODE.UNKNOWN_CUSTOMER;
    error.message = `${msg} Unknown cloud-name ${cloudName}`;
  }
  if (err.startsWith('resource not found')) {
    error.code = ERROR_CODE.RESOURCE_NOT_FOUND;
    error.message = `${msg} Public ID ${publicId} not found`;
  }
  if (err.startsWith('private resource')) {
    error.code = ERROR_CODE.PRIVATE_RESOURCE;
    error.message = `${msg} Private video`;
  }
  if (err.startsWith('unauthenticated access')) {
    error.message = `${msg} Requires authentication`;
    error.code = ERROR_CODE.UNAUTHENTICATED;
  }
  return error;
};

const codecShorthandTrans = (short) => {
  const transTable = {
    h265: 'hev1.1.6.L93.B0',
    vp9: 'vp09.00.50.08',
    h264: 'avc1.42E01E'
  };
  return transTable[short] ? transTable[short] : short;
};

const ISOAVC_MAP = {
  'avc1': 'h264',
  'avc2': 'h264',
  'svc1': 'Scalable Video Coding',
  'mvc1': 'Multiview Video Coding',
  'mvc2': 'Multiview Video Coding'
};


const PROFILE = {
  '0': 'No', //  0             - *** when profile=RCDO and level=0 - "RCDO"  - RCDO bitstream MUST obey to all the constraints of the Baseline profile
  '42': 'baseline', // 66 in-decimal
  '4d': 'main', // 77 in-decimal
  '58': 'extended', // 88 in-decimal
  '64': 'high', // 100 in-decimal
  '6e': 'high 10', // 110 in-decimal
  '7a': 'high 4:2:2', // 122 in-decimal
  'f4': 'high 4:4:4', // 244 in-decimal
  '2c': 'CAVLC 4:4:4', // 44 in-decimal

  // profiles for SVC - Scalable Video Coding extension to H.264
  '53': 'Scalable Baseline', // 83 in-decimal
  '56': 'Scalable High', // 86 in-decimal

  // profiles for MVC - Multiview Video Coding extension to H.264
  '80': 'Stereo High', // 128 in-decimal
  '76': 'Multiview High', // 118 in-decimal
  '8a': 'Multiview Depth High' // 138 in-decimal
};


function avcotiToStr(s) {
  let REGEX = /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i;

  if (REGEX.test(s) === false) {
    throw new Error('error: please provide a 3-bytes hex-sequence for example: 42001e');
  }
  let matches = s.match(REGEX);
  matches.shift(); // kills first one (regex matchs entire string)

  let profile_idc = matches[0];
  profile_idc = PROFILE[profile_idc];
  profile_idc = typeof profile_idc === 'string' ? profile_idc : 'Unknown'; // explicit fix.

  // constraint_set_flags  = matches[1]; //maybe some other time..

  let level_idc = matches[2];
  level_idc = parseInt(level_idc, 16); // will give something like 30  (integer thirty)
  level_idc = String(level_idc).split('').join('.'); // will give something like "3.0"
  return `${profile_idc}:${level_idc}`;
}


const h264avcToString = (s) => {
  let REGEX = /(avc1|avc2|svc1|mvc1|mvc2)\.([0-9a-f]{6})/i;
  if (REGEX.test('avc1.42001e') === false) {
    throw new Error('Codec string is not formatted according to H.264/AVC standards for example avc1.42001e (maybe an iOS friendly version...)');
  }
  let matches = s.match(REGEX);
  if (matches !== null) {
    matches.shift(); // first one is the entire-string.

    let vc_codec = ISOAVC_MAP[matches[0]];
    let avc_codec = typeof avc_codec === 'string' ? avc_codec : 'Unknown'; // explicit fix

    return vc_codec + ':' + avcotiToStr(matches[1]);
  }
  return s;
};

export const VIDEO_CODEC = {
  VP9: 'vp9',
  HEV1: 'hev1',
  H265: 'h265',
  H264: 'h264'
};

const codecToSrcTransformation = (codec) => {
  if (!codec) {
    return {};
  }

  switch (codec) {
    case VIDEO_CODEC.VP9:
      return { video_codec: VIDEO_CODEC.VP9 };
    case VIDEO_CODEC.HEV1:
      return { video_codec: VIDEO_CODEC.H265 };
    case VIDEO_CODEC.H264:
      return { video_codec: `${VIDEO_CODEC.H264}:baseline:3.0` };
    default:
      return { video_codec: h264avcToString(codec) };
  }
};


export {
  normalizeOptions,
  isSrcEqual,
  mergeTransformations,
  cloudinaryErrorsConverter,
  codecShorthandTrans,
  h264avcToString,
  codecToSrcTransformation,
  ERROR_CODE
};
