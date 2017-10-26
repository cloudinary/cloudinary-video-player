import cloudinary from 'cloudinary-core';
import { normalizeOptions } from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { getCloudinaryInstanceOf } from 'utils/cloudinary';

class BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    let _publicId = null;
    let _cloudinaryConfig = null;
    let _transformation = null;
    let _resourceConfig = null;

    this.publicId = (publicId) => {
      if (!publicId) {
        return _publicId;
      }

      _publicId = publicId;

      return this;
    };

    this.cloudinaryConfig = (config) => {
      if (!config) {
        return _cloudinaryConfig;
      }

      _cloudinaryConfig = getCloudinaryInstanceOf(cloudinary.Cloudinary, config);

      return this;
    };

    this.resourceConfig = (config) => {
      if (!config) {
        return _resourceConfig;
      }

      _resourceConfig = config;

      return this;
    };

    this.transformation = (trans) => {
      if (!trans) {
        return _transformation;
      }

      _transformation = getCloudinaryInstanceOf(cloudinary.Transformation, trans);

      return this;
    };

    const { cloudinaryConfig } = sliceAndUnsetProperties(options, 'cloudinaryConfig');
    if (!cloudinaryConfig) {
      throw new Error('Source is missing \'cloudinaryConfig\'.');
    }
    this.cloudinaryConfig(cloudinaryConfig);

    const { transformation } = sliceAndUnsetProperties(options, 'transformation');
    this.transformation(transformation);

    this.resourceConfig(options);

    this.publicId(publicId);
  }

  config() {
    const cld = new cloudinary.Cloudinary(this.cloudinaryConfig().config());
    cld.config(this.resourceConfig());

    return cld;
  }

  url({ transformation } = {}) {
    return this.config().url(this.publicId(), { transformation: transformation || this.transformation() });
  }
}

export default BaseSource;
