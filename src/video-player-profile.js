import VideoPlayer from './video-player';

export const getProfile = async (cloudName, profile) => {
  const defaultProfiles = await import(/* webpackChunkName: "defaultProfiles" */ './config/profiles');

  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  return await fetch(profile, { method: 'GET' }).then(res => res.json());
};

const videoPlayerProfile = async (elem, initOptions, ready) => {
  if (!initOptions.profile) {
    throw new Error('VideoPlayerProfile method requires "profile" property');
  }

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
    return videoPlayer;
  }
};

export default videoPlayerProfile;
