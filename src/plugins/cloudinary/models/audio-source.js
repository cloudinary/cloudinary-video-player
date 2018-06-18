import VideoSource from './video-source';
import ImageSource from './image-source';
import { normalizeOptions } from '../common';
import { sliceAndUnsetProperties } from 'utils/slicing';
import assign from 'utils/assign';
import { objectToQuerystring } from 'utils/querystring';


const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video', transformation: { flags: 'waveform' } };
const COMMON_AUDIO_FORMATS = ['mp3', 'ogg', 'wav', 'mp4'];
const AUDIO_SUFFIX_REMOVAL_PATTERN = RegExp(`\.(${COMMON_AUDIO_FORMATS.join('|')})$$`);
const DEFAULT_AUDIO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  transformation: []
};

class AudioSource extends VideoSource {
  constructor(publicId, options = {}) {
    ({ publicId, options } = normalizeOptions(publicId, options));

    publicId = publicId.replace(AUDIO_SUFFIX_REMOVAL_PATTERN, '');

    options = assign({}, DEFAULT_AUDIO_PARAMS, options);
    const { poster } = sliceAndUnsetProperties(options, 'poster');

    super(publicId, options);
    let _poster = null;
    this.poster = (publicId, options = {}) => {
      if (!publicId) {
        return _poster;
      }

      if (publicId instanceof ImageSource) {
        _poster = publicId;
        return this;
      }

      ({ publicId, options } = normalizeOptions(publicId, options, { tolerateMissingId: true }));

      if (!publicId) {
        publicId = this.publicId();
        options = assign({}, options, DEFAULT_POSTER_PARAMS);
      }

      options.cloudinaryConfig = options.cloudinaryConfig || this.cloudinaryConfig();
      _poster = new ImageSource(publicId, options);

      return this;
    };
    this.poster(poster);
    this.getPoster = () => _poster;

  }


  generateSources() {
    return this.sourceTypes().map((sourceType) => {
      if (sourceType === 'audio') {
        const format = 'mp3';
        const opts = {};
        assign(opts, { resource_type: 'video', format });
        let queryString = '';
        if (this.queryParams()) {
          queryString = objectToQuerystring(this.queryParams());
        }
        const src = `${this.config().url(this.publicId(), opts)}${queryString}`;
        const type = 'video/mp4';
        return { type, src, cldSrc: this, poster: this.getPoster().url() };
      } else {
        return null;
      }
    }, this);
  }
}

export default AudioSource;
