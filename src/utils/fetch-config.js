import { defaultProfiles } from 'cloudinary-video-player-profiles';
import { isRawUrl, getCloudinaryUrlPrefix } from '../plugins/cloudinary/common';
import { utf8ToBase64 } from '../utils/utf8Base64';

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

  const urlPrefix = getCloudinaryUrlPrefix(cloudinaryConfig) + '/_applet_/video_service';


  let configUrl;
  if (profile) {
    configUrl = isRawUrl(profile) 
      ? profile 
      : `${urlPrefix}/video_player_profiles/${profile.replaceAll(' ', '+')}.json`;
  } else if (publicId) {
    configUrl = `${urlPrefix}/video_player_config/video/${type}/${utf8ToBase64(publicId)}.json`;
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
  const fetchedConfig = profileOptions.playerOptions ? Object.keys(profileOptions.playerOptions) : [];
  const profileAnalytics = {
    _internalAnalyticsMetadata: {
      newPlayerMethod: true,
      ...(options.profile ? {
        profile: isDefaultProfile(options.profile) ? options.profile : true
      } : {}),
      ...(!options.profile && options.publicId ? {
        videoConfig: true
      } : {}),
      ...(fetchedConfig.length > 0 ? {
        fetchedConfig: fetchedConfig.join(',')
      } : {})
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

