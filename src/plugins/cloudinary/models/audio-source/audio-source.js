import VideoSource from '../video-source/video-source';
import ImageSource from '../image-source';
import { normalizeOptions } from '../../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import { appendQueryParams } from 'utils/querystring';
import { AUDIO_SUFFIX_REMOVAL_PATTERN, DEFAULT_AUDIO_PARAMS, DEFAULT_POSTER_PARAMS } from './audio-source.const';
import { SOURCE_TYPE } from '../../../../utils/consts';


class AudioSource extends VideoSource {

  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    publicId = publicId.replace(AUDIO_SUFFIX_REMOVAL_PATTERN, '');

    options = Object.assign({}, DEFAULT_AUDIO_PARAMS, options);
    const { poster } = sliceAndUnsetProperties(options, 'poster');

    super(publicId, options);
    this._poster = null;
    this._type = SOURCE_TYPE.AUDIO;
    this.poster(poster);
  }

  getPoster () {
    return this._poster;
  }

  poster(publicId, options = {}) {
    if (!publicId) {
      return this._poster;
    }

    if (publicId instanceof ImageSource) {
      this._poster = publicId;
      return this;
    }

    // For audio, we convert poster: true to waveform poster (not applet)
    if (publicId === true) {
      publicId = this.publicId();
      options = Object.assign({}, options, DEFAULT_POSTER_PARAMS);
    } else {
      ({ publicId, options } = normalizeOptions(publicId, options, { tolerateMissingId: true }));

      if (!publicId) {
        publicId = this.publicId();
        options = Object.assign({}, options, DEFAULT_POSTER_PARAMS);
      }
    }

    options.cloudinaryConfig = options.cloudinaryConfig || this.cloudinaryConfig();
    this._poster = new ImageSource(publicId, options);

    return this;
  }

  generateSources() {
    return this.sourceTypes().map((sourceType) => {

      if (sourceType === 'audio') {
        const format = 'mp3';
        const opts = {};
        const srcTransformation = this.sourceTransformation()[sourceType] || [this.transformation()];

        if (srcTransformation) {
          opts.transformation = srcTransformation;
        }

        Object.assign(opts, { resource_type: 'video', format });
        const src = appendQueryParams(this.config().url(this.publicId(), opts), this.queryParams());
        const type = 'video/mp4';
        return { type, src, cldSrc: this, poster: this.getPoster().url() };
      } else {
        return null;
      }
    }, this);
  }
}

export default AudioSource;
