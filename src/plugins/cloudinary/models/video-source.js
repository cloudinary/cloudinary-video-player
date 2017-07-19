import BaseSource from './base-source'
import ImageSource from './image-source'
import { normalizeOptions, compareSources } from '../common'
import { sliceAndUnsetProperties } from 'utils/slicing'

const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video' }
const DEFAULT_VIDEO_SOURCE_TYPES = ['webm', 'mp4', 'ogv']
const DEFAULT_VIDEO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  transformation: [],
  sourceTransformation: {},
  sourceTypes: DEFAULT_VIDEO_SOURCE_TYPES
}
const VIDEO_SUFFIX_REMOVAL_PATTERN = RegExp(`\.(${DEFAULT_VIDEO_SOURCE_TYPES.join('|')})$$`)

class VideoSource extends BaseSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options))

    publicId = publicId.replace(VIDEO_SUFFIX_REMOVAL_PATTERN, '')

    options = Object.assign({}, DEFAULT_VIDEO_PARAMS, options)

    if (!options.poster) {
      options.poster = Object.assign({ publicId }, DEFAULT_POSTER_PARAMS)
    }

    const { poster, sourceTypes, sourceTransformation } =
      sliceAndUnsetProperties(options, 'poster', 'sourceTypes', 'sourceTransformation')

    super(publicId, options)

    this.poster(poster)
    this.sourceTypes(sourceTypes)
    this.sourceTransformation(sourceTransformation)
  }

  poster(publicId, options = {}) {
    if (!publicId) {
      return this._poster
    }

    if (publicId.constructor.name === 'ImageSource') {
      this._poster = publicId
      return this
    }

    ({ publicId, options } = normalizeOptions(publicId, options, { tolerateMissingId: true }))

    if (!publicId) {
      publicId = this.publicId()
      options = Object.assign({}, options, DEFAULT_POSTER_PARAMS)
    }

    options.cloudinaryConfig = options.cloudinaryConfig || this.cloudinaryConfig()
    this._poster = new ImageSource(publicId, options)

    return this
  }

  sourceTypes(types) {
    if (!types) {
      return this._sourceTypes
    }

    this._sourceTypes = types

    return this
  }

  sourceTransformation(trans) {
    if (!trans) {
      return this._sourceTransformation
    }

    this._sourceTransformation = trans

    return this
  }

  contains(source) {
    const sources = this.generateSources()
    return sources.some((_source) => compareSources(_source, source))
  }

  generateSources() {
    return this.sourceTypes().map((sourceType) => {
      const srcTransformation = this.sourceTransformation()[sourceType] || this.transformation()
      const format = normalizeFormat(sourceType)
      const opts = {}
      if (srcTransformation) {
        opts.transformation = srcTransformation
      }
      Object.assign(opts, { resource_type: 'video', format })

      const src = this._urlConfig().url(this.publicId(), opts)
      const type = formatToMimeType(sourceType)
      return { type, src }
    })
  }
}

const FORMAT_MIME_TYPES = {
  ogv: 'video/ogg',
  mpd: 'application/dash+xml',
  m3u8: 'application/x-mpegURL'
}

function formatToMimeType(format) {
  format = normalizeFormat(format)

  let res = FORMAT_MIME_TYPES[format]
  if (!res) {
    res = `video/${format}`
  }

  return res
}

const FORMAT_MAPPINGS = {
  hls: 'm3u8',
  dash: 'mpd'
}

function normalizeFormat(format) {
  format = format.toLowerCase()

  let res = FORMAT_MAPPINGS[format]
  if (!res) {
    res = format
  }

  return res
}

export default VideoSource
