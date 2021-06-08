export const DEFAULT_POSTER_PARAMS = { format: 'jpg', resource_type: 'video', transformation: { flags: 'waveform' } };

export const COMMON_AUDIO_FORMATS = ['mp3', 'ogg', 'wav', 'mp4'];

export const AUDIO_SUFFIX_REMOVAL_PATTERN = RegExp(`\\.(${COMMON_AUDIO_FORMATS.join('|')})$$`);

export const DEFAULT_AUDIO_PARAMS = {
  resource_type: 'video',
  type: 'upload',
  transformation: []
};
