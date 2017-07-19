import mixin from 'utils/mixin'
import applyWithProps from 'utils/apply-with-props'
import { sliceAndUnsetProperties } from 'utils/slicing'
import { getCloudinaryInstanceOf } from 'utils/cloudinary'
import { normalizeOptions, mergeTransformation, mergeCloudinaryConfig } from './common'
import Playlistable from './mixins/playlistable'
import VideoSource from './models/video-source'
import EventHandlerRegistry from './event-handler-registry'

const DEFAULT_PARAMS = {
  transformation: {},
  sourceTypes: [],
  sourceTransformation: [],
  posterOptions: {}
}

export const SOURCE_PARAMS = ['cloudinaryConfig', 'transformation',
  'sourceTypes', 'sourceTransformation', 'posterOptions']

class CloudinaryContext extends mixin(Playlistable) {
  constructor(player, options = {}) {
    super()

    this.player = player
    this._playerEvents = new EventHandlerRegistry(this.player)
    this._chainTarget = sliceAndUnsetProperties(options, 'chainTarget').chainTarget

    options = Object.assign({}, DEFAULT_PARAMS, options)

    const srcParams = sliceAndUnsetProperties(options, ...SOURCE_PARAMS)

    applyWithProps(this, srcParams)

    this._addSourceChangedListener()
  }

  // source("oceans")
  // source("oceans", { transformation: { width: 50, height: 100, crop: 'limit' } })
  // source({ publicId: 'oceans', transformation: { width: 50, height: 100, crop: 'limit' } })
  source(source, options = {}) {
    if (!source) {
      return this._source
    }

    const src = source.constructor.name === 'VideoSource' ? source
      : this._buildSource(source, options)
    this._source = src
    this._refresh()

    return this._chainTarget
  }

  currentPublicId() {
    return this.source() && this.source().publicId()
  }

  currentPoster() {
    return this.source() && this.source().poster()
  }

  posterOptions(options) {
    if (!options) {
      return this._posterOptions
    }

    this._posterOptions = options

    return this._chainTarget
  }

  cloudinaryConfig(config) {
    if (!config) {
      return this._cloudinaryConfig
    }

    this._cloudinaryConfig = getCloudinaryInstanceOf('Cloudinary', config)

    return this._chainTarget
  }

  transformation(trans) {
    if (!trans) {
      return this._transformation
    }

    this._transformation = getCloudinaryInstanceOf('Transformation', trans)

    return this._chainTarget
  }

  sourceTypes(types) {
    if (!types) {
      return this._sourceTypes
    }

    this._sourceTypes = types

    return this._chainTarget
  }

  sourceTransformation(trans) {
    if (!trans) {
      return this._sourceTransformation
    }

    this._sourceTransformation = trans

    return this._chainTarget
  }

  dispose() {
    this._playerEvents.removeAllListeners()
  }

  _refresh() {
    const src = this.source()
    if (src.poster()) {
      this.player.poster(src.poster().url())
    }

    this.player.src(src.generateSources())
  }

  _buildSource(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options))

    options.cloudinaryConfig = this._mergeCloudinaryConfig(options.cloudinaryConfig)
    options.transformation = this._mergeTransformation(options.transformation)
    options.sourceTransformation = options.sourceTransformation || this.sourceTransformation()
    options.sourceTypes = options.sourceTypes || this.sourceTypes()
    options.poster = options.poster || this._posterOptionsForCurrent()

    const video = new VideoSource(publicId, options)

    return video
  }

  _posterOptionsForCurrent() {
    const opts = Object.assign({}, this.posterOptions())

    opts.transformation = getCloudinaryInstanceOf('Transformation', opts.transformation || {})
    if (this.player.width() > 0 && this.player.height() > 0) {
      opts.transformation.width(this.player.width()).height(this.player.height()).crop('limit')
    }

    return opts
  }

  _addSourceChangedListener() {
    const disposer = (_, data) => {
      if (this.source() && !this.source().contains(data.to)) {
        this._source = undefined
      }
    }

    this._playerEvents.on('sourcechanged', disposer)
  }

  _mergeCloudinaryConfig(config) {
    return mergeCloudinaryConfig(this.cloudinaryConfig(), config || {})
  }

  _mergeTransformation(transformation) {
    return mergeTransformation(this.transformation(), transformation || {})
  }
}

export default function(options = {}) {
  options.chainTarget = options.chainTarget || this
  this.cloudinary = new CloudinaryContext(this, options)
}
