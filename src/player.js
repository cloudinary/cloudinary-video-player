import VideoPlayer from './video-player';
import { defaultProfiles } from './config/profiles';
import { isRawUrl } from './plugins/cloudinary/common';

export const getProfile = async (cloudName, profile, secureDistribution) => {
  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  const cloudinaryDomain = secureDistribution === 'res-staging.cloudinary.com' ? secureDistribution : 'res.cloudinary.com';
  const profileUrl = isRawUrl(profile) ? profile :
    `https://${cloudinaryDomain}/${cloudName}/_applet_/video_service/video_player_profiles/${profile}.json`;
  return await fetch(profileUrl, { method: 'GET' }).then(res => res.json());
};

const player = async (elem, initOptions, ready) => {
  const { profile, ...otherInitOptions } = initOptions;
  try {
    const profileOptions = profile ? await getProfile(otherInitOptions.cloud_name, profile, otherInitOptions.secure_distribution) : {};
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
