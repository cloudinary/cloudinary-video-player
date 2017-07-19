import cloudinary from 'cloudinary-core'
import { normalizeOptions } from '../common'
import { sliceAndUnsetProperties } from 'utils/slicing'
import { getCloudinaryInstanceOf } from 'utils/cloudinary'

class BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options))

    const { cloudinaryConfig } = sliceAndUnsetProperties(options, 'cloudinaryConfig')
    if (!cloudinaryConfig) {
      throw new Error('Source is missing \'cloudinaryConfig\'.')
    }
    this.cloudinaryConfig(cloudinaryConfig)

    const { transformation } = sliceAndUnsetProperties(options, 'transformation')
    this.transformation(transformation)

    this.resourceConfig(options)

    this.publicId(publicId)
  }

  publicId(publicId) {
    if (!publicId) {
      return this._publicId
    }

    this._publicId = publicId

    return this
  }

  cloudinaryConfig(config) {
    if (!config) {
      return this._cloudinaryConfig
    }

    this._cloudinaryConfig = getCloudinaryInstanceOf('Cloudinary', config)

    return this
  }

  resourceConfig(config) {
    if (!config) {
      return this._resourceConfig
    }

    this._resourceConfig = config

    return this
  }

  transformation(trans) {
    if (!trans) {
      return this._transformation
    }

    this._transformation = getCloudinaryInstanceOf('Transformation', trans)

    return this
  }


  url() {
    return this._urlConfig().url(this.publicId(), { transformation: this.transformation() })
  }

  _urlConfig() {
    const cld = new cloudinary.Cloudinary(this.cloudinaryConfig().config())
    cld.config(this.resourceConfig())

    return cld
  }
}

export default BaseSource
