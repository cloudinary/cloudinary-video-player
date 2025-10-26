import VideoPlayer from './video-player';
import { defaultProfiles } from 'cloudinary-video-player-profiles';
import { isRawUrl, getCloudinaryUrlPrefix } from './plugins/cloudinary/common';
import isString from 'lodash/isString';

const isDefaultProfile = (profileName) => !!defaultProfiles.find(({ name }) => profileName === name);

const getDefaultProfileConfig = (profileName) => {
  const profile = defaultProfiles.find(({ name }) => profileName === name);

  if (!profile) {
    throw new Error(`Default profile with name ${profileName} does not exist`);
  }

  return profile.config;
};

export const fetchConfig = async (options) => {
  const { profile, publicId, cloudinaryConfig } = options;
  
  if (profile && isDefaultProfile(profile)) {
    return getDefaultProfileConfig(profile);
  }

  const urlPrefix = getCloudinaryUrlPrefix(cloudinaryConfig) + '/_applet_/video_service/video_player_profiles';

  // TODO: implement when endpoints are ready
  //  For profiles:
  // '_applet_/video_player_config/profile/{profile}.json'
  //  For video-specific:
  // '_applet_/video_player_config/video/{delivery_type}/{publicId}.json'

  let profileUrl;
  if (profile && isString(profile)) {
    profileUrl = isRawUrl(profile) 
      ? profile 
      : `${urlPrefix}/${profile.replaceAll(' ', '+')}.json`;
  } else if (publicId) {
    profileUrl = `${urlPrefix}/${publicId}/config.json`;
  } else {
    return {};
  }
  
  return fetch(profileUrl, { method: 'GET' }).then(res => {
    if (!res.ok) {
      // fail silently
      return {};
    }
    return res.json();
  });
};

const player = async (elem, options, ready) => {
  try {
    const profileOptions = await fetchConfig(options);
    
    const mergedOptions = Object.assign({}, profileOptions.playerOptions, options);
    
    return new VideoPlayer(elem, mergedOptions, ready);
  } catch (e) {
    const videoPlayer = new VideoPlayer(elem, options);
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export default player;
