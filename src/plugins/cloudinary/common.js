import videojs from 'video.js';
import omit from 'lodash/omit';
import { sliceAndUnsetProperties } from 'utils/slicing';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { createCloudinaryLegacyURL } from '@cloudinary/url-gen/backwards/createCloudinaryLegacyURL';
import Transformation from '@cloudinary/url-gen/backwards/transformation';

export { isRawUrl } from '../../utils/isRawUrl';

const normalizeOptions = (publicId, options, { tolerateMissingId = false } = {}) => {
  if (isObject(publicId)) {
    const _options = Object.assign({}, publicId);

    publicId = sliceAndUnsetProperties(_options, 'publicId').publicId;

    if (!isString(publicId) && !tolerateMissingId) {
      throw new Error('Source is missing \'publicId\'.');
    }

    if (options) {
      options = Object.assign({}, _options, options);
    }
  }

  return { publicId, options };
};

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

export const extendCloudinaryConfig = (currentConfig, newConfig) =>
  Object.assign(currentConfig, newConfig);

export const getCloudinaryUrl = (publicId, transformation) =>
  createCloudinaryLegacyURL(publicId, omit(transformation, ['chainTarget']));

const isTransformationInstance = transformation =>
  transformation.constructor.name === 'Transformation' && transformation.toOptions;

const mergeTransformations = (initTransformation1, transformation2) => {
  const transformation1 = isTransformationInstance(initTransformation1)
    ? initTransformation1.toOptions()
    : initTransformation1;

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
  let error = {
    code: ERROR_CODE.CUSTOM,
    message: `${msg}${errorMsg ? '- ' + errorMsg : ''}`,
    statusCode: statusCode
  };
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

export const VIDEO_CODEC = {
  VP9: 'vp9',
  HEV1: 'hev1',
  H265: 'h265',
  H264: 'h264'
};

const setupCloudinaryMiddleware = () => {
  // Allow 'auto' as a source type
  videojs.use('video/auto', () => {
    return {
      async setSource(srcObj, next) {
        const { headers } = await fetch(srcObj.src, {
          method: 'HEAD',
          credentials: srcObj.withCredentials ? 'include' : 'omit'
        });

        return next(null, {
          src: srcObj.src,
          type: headers.get('content-type')
        });
      }
    };
  });
};

export {
  normalizeOptions,
  isSrcEqual,
  mergeTransformations,
  cloudinaryErrorsConverter,
  setupCloudinaryMiddleware,
  ERROR_CODE
};
