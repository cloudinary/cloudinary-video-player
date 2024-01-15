import { getCloudinaryUrl } from '../../plugins/cloudinary/common';
import { fetchWithTimeout } from '../../utils/fetch-with-timeout';

const defaultProfilesNames = ['loopingVideo', 'videoStream', 'stylish'];

export const getDefaultProfile = async (profileName) => {
  const defaultProfiles = {
    loopingVideo: await import(/* webpackChunkName: "profiles/loopingVideo" */ '../../profiles/loopingVideo.json'),
    videoStream: await import(/* webpackChunkName: "profiles/videoStream" */ '../../profiles/videoStream.json'),
    stylish: await import(/* webpackChunkName: "profiles/stylish" */ '../../profiles/stylish.json')
  };

  if (!defaultProfiles[profileName]) {
    throw new Error(`Default profile ${profileName} does not exist`);
  }

  return defaultProfiles[profileName];
};

// temporary solution, we don't have BE ready so try to take profile from cloud
export const getCustomProfile = async (cloudName, profileName, timeout = 10000) => {
  const profileUrl = getCloudinaryUrl(
    `profiles/${profileName}`,
    {
      cloud_name: cloudName,
      resource_type: 'raw',
      secure: true
    },
  );

  const response = await fetchWithTimeout(profileUrl, {
    method: 'GET',
    timeout
  });
  return await response.json();
};

export const getProfile = async (cloudName, profileName, timeout = 10000) => {
  if (defaultProfilesNames.includes(profileName)) {
    return await getDefaultProfile(profileName);
  }

  return await getCustomProfile(cloudName, profileName, timeout);
};
