import { getCloudinaryUrl, isRawUrl, mergeTransformations, normalizeOptions } from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { objectToQuerystring } from 'utils/querystring';


class BaseSource {
  _transformation = null;

  constructor(initPublicId, initOptions = {}) {

    const { publicId, options } = normalizeOptions(initPublicId, initOptions);
    const { cloudinaryConfig } = sliceAndUnsetProperties(options, 'cloudinaryConfig');
    const { transformation } = sliceAndUnsetProperties(options, 'transformation');
    const { queryParams } = sliceAndUnsetProperties(options, 'queryParams');

    if (!cloudinaryConfig) {
      throw new Error('Source is missing "cloudinaryConfig".');
    }

    this.publicId = () => publicId;
    this.cloudinaryConfig = () => cloudinaryConfig;
    this.resourceConfig = () => options;
    this.queryParams = () => queryParams;
    this.getType = () => this._type;
    this.transformation(transformation);
  }

  transformation(transformation) {
    if (transformation) {
      this._transformation = transformation;
    }

    return this._transformation;
  }

  config() {
    const coreConfig = this.cloudinaryConfig();

    return {
      cloud_name: coreConfig.cloudName,
      url: (publicId, initTransformation) => {
        if (isRawUrl(publicId)) {
          return publicId;
        }

        const transformation = mergeTransformations(this.resourceConfig(), initTransformation);

        return getCloudinaryUrl(publicId, {
          ...coreConfig,
          ...transformation
        });
      }
    };
  }

  url({ transformation } = {}) {
    const url = this.config().url(this.publicId(), { transformation: transformation || this.transformation() });

    const queryString = this.queryParams() ? objectToQuerystring(this.queryParams()) : '';
    return `${url}${queryString}`;
  }
}

export default BaseSource;
