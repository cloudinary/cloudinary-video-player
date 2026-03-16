import { URL_PATTERN } from './models/video-source/video-source.const';
import { unsigned_url_prefix } from '@cloudinary/url-gen/backwards/utils/unsigned_url_prefix';

export const isRawUrl = publicId => URL_PATTERN.test(publicId);

export const getCloudinaryUrlPrefix = (cloudinaryConfig) => {
  return unsigned_url_prefix(
    null,
    cloudinaryConfig.cloud_name,
    cloudinaryConfig.private_cdn,
    cloudinaryConfig.cdn_subdomain,
    cloudinaryConfig.secure_cdn_subdomain,
    cloudinaryConfig.cname,
    cloudinaryConfig.secure ?? true,
    cloudinaryConfig.secure_distribution,
  );
};
