import VideoPlayer from './video-player';
import { defaultProfiles } from 'cloudinary-video-player-profiles';
import { isRawUrl, getCloudinaryUrlPrefix } from './plugins/cloudinary/common';

const isDefaultProfile = (profileName) => !!defaultProfiles.find(({ name }) => profileName === name);
const getDefaultProfileConfig = (profileName) => {
  const profile = defaultProfiles.find(({ name }) => profileName === name);

  if (!profile) {
    throw new Error(`Default profile with name ${profileName} does not exist`);
  }

  return profile.config;
};

export const getProfile = async (profile, initOptions) => {
  if (isDefaultProfile(profile)) {
    return getDefaultProfileConfig(profile);
  }

  const urlPrefix = getCloudinaryUrlPrefix(initOptions.cloudinaryConfig);

  const profileUrl = isRawUrl(profile) ? profile : `${urlPrefix}/_applet_/video_service/video_player_profiles/${profile.replaceAll(' ', '+')}.json`;
  return fetch(profileUrl, { method: 'GET' }).then(res => res.json());
};

const player = async (elem, initOptions, ready) => {
  const { profile, ...otherInitOptions } = initOptions;
  try {
    const profileOptions = profile ? await getProfile(profile, otherInitOptions) : {};
    const options = Object.assign({}, profileOptions.playerOptions, profileOptions.sourceOptions, otherInitOptions, {
      _internalAnalyticsMetadata: {
        newPlayerMethod: true,
        profile: isDefaultProfile(profile) ? profile : !!profile,
      },
    });
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
