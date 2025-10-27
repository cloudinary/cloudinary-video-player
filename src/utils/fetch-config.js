import { defaultProfiles } from 'cloudinary-video-player-profiles';
import { isRawUrl, getCloudinaryUrlPrefix } from '../plugins/cloudinary/common';

const isDefaultProfile = (profileName) => !!defaultProfiles.find(({ name }) => profileName === name);

const getDefaultProfileConfig = (profileName) => {
  const profile = defaultProfiles.find(({ name }) => profileName === name);

  if (!profile) {
    throw new Error(`Default profile with name ${profileName} does not exist`);
  }

  return profile.config;
};

const fetchConfig = async (options) => {
  const { profile, publicId, cloudinaryConfig, type = 'upload' } = options;
  
  if (profile && isDefaultProfile(profile)) {
    return getDefaultProfileConfig(profile);
  }

  const urlPrefix = getCloudinaryUrlPrefix(cloudinaryConfig) + '/_applet_/video_service/video_player_profiles';

  // TODO: when endpoints are ready
  // const urlPrefix = getCloudinaryUrlPrefix(cloudinaryConfig) + '/_applet_/video_service/video_player_config';
  // And:
  // `${urlPrefix}/profile/${profile.replaceAll(' ', '+')}.json`;

  let configUrl;
  if (profile) {
    configUrl = isRawUrl(profile) 
      ? profile 
      : `${urlPrefix}/${profile.replaceAll(' ', '+')}.json`;
  } else if (publicId) {
    configUrl = `${urlPrefix}/video/${type}/${publicId}.json`;
    // TODO: remove when endpoints are ready
    console.log('This will fetch:', configUrl);
    return {};
  } else {
    return {};
  }
  
  return fetch(configUrl, { method: 'GET' }).then(res => {
    if (!res.ok) {
      // fail silently
      return {};
    }
    return res.json();
  });
};

export const fetchAndMergeConfig = async (options) => {
  const profileOptions = await fetchConfig(options);
  const profileAnalytics = {
    _internalAnalyticsMetadata: {
      newPlayerMethod: true,
      profile: options.profile ? (isDefaultProfile(options.profile) ? options.profile : true) : undefined
    }
  };
  return Object.assign(
    {}, 
    profileOptions.playerOptions || {}, 
    profileOptions.sourceOptions || {}, 
    options,
    profileAnalytics
  );
};

