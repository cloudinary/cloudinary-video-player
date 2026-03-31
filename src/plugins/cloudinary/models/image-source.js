import BaseSource from './base-source';
import { normalizeOptions } from '../common';

const DEFAULT_IMAGE_PARAMS = {
  resource_type: 'image',
  type: 'upload',
  transformation: []
};

class ImageSource extends BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    options = Object.assign({}, DEFAULT_IMAGE_PARAMS, options);

    super(publicId, options);
    this._type = 'ImageSource';
  }
}

export default ImageSource;
