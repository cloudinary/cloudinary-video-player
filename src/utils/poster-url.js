/**
 * Minimal Cloudinary poster URL builder for video first frame.
 * Used by schedule bootstrap when outside schedule (no full player loaded).
 */
import { unsigned_url_prefix } from '@cloudinary/url-gen/backwards/utils/unsigned_url_prefix';

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
    private_cdn: cloudinaryConfig.private_cdn,
    cdn_subdomain: cloudinaryConfig.cdn_subdomain,
    secure_cdn_subdomain: cloudinaryConfig.secure_cdn_subdomain,
    cname: cloudinaryConfig.cname,
    secure: cloudinaryConfig.secure ?? true,
    secure_distribution: cloudinaryConfig.secure_distribution
  };

  const prefix = unsigned_url_prefix(
    null,
    config.cloud_name,
    config.private_cdn,
    config.cdn_subdomain,
    config.secure_cdn_subdomain,
    config.cname,
    config.secure,
    config.secure_distribution
  );

  return `${prefix}/video/upload/${POSTER_TRANSFORMATION}/${publicId}`;
};
