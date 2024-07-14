import VideoPlayer from './video-player';
import { defaultProfiles } from './config/profiles';

export const getProfile = async (cloudName, profile) => {
  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  console.warn('Custom profiles loading mechanism will be changed soon');
  return await fetch(profile, { method: 'GET' }).then(res => res.json());
};

const player = async (elem, initOptions, ready) => {
  const { profile, ...filteredInitOptions } = initOptions;
  try {
    const profileOptions = profile ? await getProfile(filteredInitOptions.cloud_name, profile) : {};
    const options = Object.assign({}, profileOptions.playerOptions, filteredInitOptions);
    const videoPlayer = new VideoPlayer(elem, options, ready);

    const nativeVideoPlayerSourceMethod = videoPlayer.source;
    videoPlayer.source = (id, options) => {
      const extendedOptions = Object.assign({}, profileOptions.sourceOptions, options);
      return nativeVideoPlayerSourceMethod.call(videoPlayer, id, extendedOptions);
    };

    return videoPlayer;
  } catch (e) {
    const videoPlayer = new VideoPlayer(elem, filteredInitOptions);
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export default player;
