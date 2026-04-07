/**
 * Cloudinary video poster URLs for bootstrap paths (lazy shell, schedule image) where the full player is not loaded.
 * Default delivery matches VideoSource poster defaults: video resource, JPG still.
 */
import { getCloudinaryUrlPrefix } from './cloudinary-url-prefix';

/**
 * @param {string} cloudName
 * @param {string} publicId
 * @param {object} [cloudinaryConfig] - Same shape as player `cloudinaryConfig` (e.g. private_cdn, cname, secure).
 * @returns {string}
 */
export const buildPosterUrl = (cloudName, publicId, cloudinaryConfig = {}) => {
  const config = {
    cloud_name: cloudName || cloudinaryConfig.cloud_name,
    ...cloudinaryConfig,
    secure: cloudinaryConfig.secure ?? true
  };

  const prefix = getCloudinaryUrlPrefix(config);
  return `${prefix}/video/upload/${publicId}.jpg`;
};

/**
 * Resolves the poster URL for lazy bootstrap from player options.
 *
 * @param {object} options - Player options (`poster`, `cloudName` / `cloud_name`, `publicId` / `sourceOptions.publicId`, `cloudinaryConfig`).
 * @returns {string}
 * @throws {Error} When no explicit `poster` string and cloud name + public id are missing.
 */
export const getPosterUrl = (options) => {
  if (typeof options?.poster === 'string' && options.poster.length > 0) {
    return options.poster;
  }
  const cloudName = options?.cloudName || options?.cloud_name || options?.cloudinaryConfig?.cloud_name;
  const publicId = options?.publicId || options?.sourceOptions?.publicId;
  if (cloudName && publicId) {
    return buildPosterUrl(cloudName, publicId, options?.cloudinaryConfig || { cloud_name: cloudName });
  }
  throw new Error('lazy requires a poster URL or cloudName and publicId');
};
