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

export const fetchConfig = async (initOptions) => {
  const profileName = initOptions.profile;

  if (profileName && isDefaultProfile(profileName)) {
    return getDefaultProfileConfig(profileName);
  }

  const urlPrefix = getCloudinaryUrlPrefix(initOptions.cloudinaryConfig);

  let profileUrl;
  // if (!profileName && initOptions.publicId) {
  //   profileUrl = `${urlPrefix}/${initOptions.publicId}/config.json`;
  // } else 
  if (isRawUrl(profileName)) {
    profileUrl = profileName;
  } else if (profileName) {
    profileUrl = `${urlPrefix}/_applet_/video_service/video_player_profiles/${profileName.replaceAll(' ', '+')}.json`;
  } else {
    return {};
  }
  
  return fetch(profileUrl, { method: 'GET' }).then(res => res.json());
};

const player = async (elem, initOptions, ready) => {
  try {
    const profileOptions = await fetchConfig(initOptions);
    const options = Object.assign({}, profileOptions.playerOptions, profileOptions.sourceOptions, initOptions, {
      _internalAnalyticsMetadata: {
        newPlayerMethod: true,
        profile: isDefaultProfile(initOptions.profile) ? initOptions.profile : !!initOptions.profile,
      },
    });
    return new VideoPlayer(elem, options, ready);
  } catch (e) {
    const videoPlayer = new VideoPlayer(elem, initOptions);
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export default player;
