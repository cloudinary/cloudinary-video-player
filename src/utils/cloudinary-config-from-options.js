import { CLOUDINARY_CONFIG_PARAM } from './cloudinary-config-param';

const CLOUDINARY_CONFIG_KEYS = new Set(CLOUDINARY_CONFIG_PARAM);

/**
 * Matches lodash `snakeCase` (avoids heavy lodash in lazy-player).
 */
const toSnakeCase = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

const pickCloudinaryKeysFromOptions = (options) => {
  const out = {};
  for (const key of Object.keys(options)) {
    const snake = toSnakeCase(key);
    if (CLOUDINARY_CONFIG_KEYS.has(snake)) {
      out[snake] = options[key];
    }
  }
  return out;
};

export const getCloudinaryConfigFromOptions = (options) => {
  if (options.cloudinaryConfig) {
    return options.cloudinaryConfig;
  }

  return Object.assign({}, pickCloudinaryKeysFromOptions(options));
};
