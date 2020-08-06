import BaseSource from './base-source';
import { normalizeOptions } from '../common';
import { assign } from 'utils/assign';

const COMMON_IMAGE_FORMATS = ['jpg', 'png', 'gif', 'webp'];
const IMAGE_SUFFIX_REMOVAL_PATTERN = RegExp(`\\.(${COMMON_IMAGE_FORMATS.join('|')})$$`);
const DEFAULT_IMAGE_PARAMS = {
  resource_type: 'image',
  type: 'upload',
  transformation: []
};

class ImageSource extends BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    publicId = publicId.replace(IMAGE_SUFFIX_REMOVAL_PATTERN, '');

    options = assign({}, DEFAULT_IMAGE_PARAMS, options);

    super(publicId, options);
    this._type = 'ImageSource';
  }
}

export default ImageSource;
