import VideoPlayer from './video-player';
import { defaultProfiles } from './config/profiles';
import { isRawUrl } from './utils/isRawUrl';

export const getProfile = async (cloudName, profile) => {
  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  if (isRawUrl(profile)) {
    return await fetch(profile, { method: 'GET' }).then(res => res.json());
  }

  throw new Error('Custom profiles will be supported soon, please use one of default profiles: "cldDefault", "cldLooping" or "cldAdaptiveStream"');
};

const player = async (elem, initOptions, ready) => {
  const { profile, ...otherInitOptions } = initOptions;
  try {
    const profileOptions = profile ? await getProfile(otherInitOptions.cloud_name, profile) : {};
    const options = Object.assign({}, profileOptions.playerOptions, otherInitOptions);
    const videoPlayer = new VideoPlayer(elem, options, ready);

    const nativeVideoPlayerSourceMethod = videoPlayer.source;
    videoPlayer.source = (id, options) => {
      const extendedOptions = Object.assign({}, profileOptions.sourceOptions, options);
      return nativeVideoPlayerSourceMethod.call(videoPlayer, id, extendedOptions);
    };

    return videoPlayer;
  } catch (e) {
    const videoPlayer = new VideoPlayer(elem, otherInitOptions);
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export default player;
