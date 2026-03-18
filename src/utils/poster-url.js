/**
 * Minimal Cloudinary poster URL builder for video first frame.
 * Used by schedule bootstrap when outside schedule (no full player loaded).
 */
import { getCloudinaryUrlPrefix } from './cloudinary-url-prefix';

const POSTER_TRANSFORMATION = 'so_0,f_auto,q_auto';

/**
 * Build Cloudinary video poster (first frame) URL.
 * @param {string} cloudName - Cloudinary cloud name
 * @param {string} publicId - Video public ID
 * @param {object} [cloudinaryConfig] - Optional: secure, private_cdn, cdn_subdomain, cname, secure_distribution
 * @returns {string} Poster image URL
 */
export const buildPosterUrl = (cloudName, publicId, cloudinaryConfig = {}) => {
  const config = {
    cloud_name: cloudName || cloudinaryConfig.cloud_name,
    ...cloudinaryConfig,
    secure: cloudinaryConfig.secure ?? true
  };

  const prefix = getCloudinaryUrlPrefix(config);
  return `${prefix}/video/upload/${POSTER_TRANSFORMATION}/${publicId}`;
};
