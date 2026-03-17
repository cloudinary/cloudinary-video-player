import { URL_PATTERN } from './models/video-source/video-source.const';

export { getCloudinaryUrlPrefix } from '../../utils/cloudinary-url-prefix';

export const isRawUrl = publicId => URL_PATTERN.test(publicId);
