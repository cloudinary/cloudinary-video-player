import pick from 'lodash/pick';
import { CLOUDINARY_CONFIG_PARAM } from '../video-player.const';
import { convertKeysToSnakeCase } from './object';

export const getCloudinaryConfigFromOptions = (options) => {
  if (options.cloudinaryConfig) {
    return options.cloudinaryConfig;
  }

  const snakeCaseCloudinaryConfig = pick(convertKeysToSnakeCase(options), CLOUDINARY_CONFIG_PARAM);
  return Object.assign({}, snakeCaseCloudinaryConfig);
};
