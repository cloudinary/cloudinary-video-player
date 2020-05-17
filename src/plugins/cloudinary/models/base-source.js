import cloudinary from 'cloudinary-core';
import { normalizeOptions } from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { getCloudinaryInstanceOf } from 'utils/cloudinary';
import { objectToQuerystring } from 'utils/querystring';

class BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    let _publicId = null;
    let _cloudinaryConfig = null;
    let _transformation = null;
    let _resourceConfig = null;
    let _queryParams = null;

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

    this.queryParams = (params) => {
      if (!params) {
        return _queryParams;
      }

      _queryParams = params;

      return this;
    };

    this.getType = () => this._type;

    const { cloudinaryConfig } = sliceAndUnsetProperties(options, 'cloudinaryConfig');
    if (!cloudinaryConfig) {
      throw new Error('Source is missing \'cloudinaryConfig\'.');
    }
    this.cloudinaryConfig(cloudinaryConfig);

    const { transformation } = sliceAndUnsetProperties(options, 'transformation');
    this.transformation(transformation);

    const { queryParams } = sliceAndUnsetProperties(options, 'queryParams');
    this.queryParams(queryParams);

    this.resourceConfig(options);

    this.publicId(publicId);
  }


  config() {
    const cld = new cloudinary.Cloudinary(this.cloudinaryConfig().config());
    cld.config(this.resourceConfig());

    return cld;
  }

  url({ transformation } = {}) {
    const url = this.config().url(this.publicId(), { transformation: transformation || this.transformation() });

    let queryString = '';
    if (this.queryParams()) {
      queryString = objectToQuerystring(this.queryParams());
    }

    return `${url}${queryString}`;
  }

}

export default BaseSource;
