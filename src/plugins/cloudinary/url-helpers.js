import { URL_PATTERN } from './profile-url-pattern';

export { getCloudinaryUrlPrefix } from '../../utils/cloudinary-url-prefix';

export const isRawUrl = publicId => URL_PATTERN.test(publicId);
