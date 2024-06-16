import VideoPlayer from './video-player';
import { defaultProfiles } from './config/profiles';

export const getProfile = async (cloudName, profile) => {
  if (typeof profile !== 'string') {
    return {};
  }

  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  return await fetch(profile, { method: 'GET' }).then(res => res.json());
};

const player = async (elem, initOptions, ready) => {
  try {
    const profileOptions = await getProfile(initOptions.cloud_name, initOptions.profile);
    const options = Object.assign({}, profileOptions.playerOptions, initOptions);
    const videoPlayer = new VideoPlayer(elem, options, ready);

    const nativeVideoPlayerSourceMethod = videoPlayer.source;
    videoPlayer.source = (id, options) => {
      const extendedOptions = Object.assign({}, profileOptions.sourceOptions, options);
      return nativeVideoPlayerSourceMethod.call(videoPlayer, id, extendedOptions);
    };

    return videoPlayer;
  } catch (e) {
    const videoPlayer = new VideoPlayer(elem, initOptions);
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export default player;
