import {
  getCloudinaryUrl,
  getTransformationsInstance,
  isRawUrl,
  mergeTransformations,
  normalizeOptions
} from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
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

      _cloudinaryConfig = config;

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

      _transformation = getTransformationsInstance(trans);

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
    const coreConfig = this.cloudinaryConfig();

    return {
      cloud_name: coreConfig.cloudName,
      url: (publicId, initTransformation) => {
        if (isRawUrl(publicId)) {
          return publicId;
        }

        const transformation = mergeTransformations(this.resourceConfig(), initTransformation).toOptions();

        return getCloudinaryUrl(publicId, {
          ...coreConfig,
          ...transformation
        });
      }
    };
  }

  url({ transformation } = {}) {
    const newTransformation = transformation || this.transformation();
    const url = this.config().url(this.publicId(), { transformation: newTransformation });

    const queryString = this.queryParams() ? objectToQuerystring(this.queryParams()) : '';
    return `${url}${queryString}`;
  }
}

export default BaseSource;
