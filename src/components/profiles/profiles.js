import { getCloudinaryUrl } from '../../plugins/cloudinary/common';
import { fetchWithTimeout } from '../../utils/fetch-with-timeout';

import loopingVideoProfile from '../../profiles/loopingVideo.json';
import videoStreamProfile from '../../profiles/videoStream.json';
import stylishProfile from '../../profiles/stylish.json';

const defaultProfiles = {
  loopingVideo: loopingVideoProfile,
  videoStream: videoStreamProfile,
  stylish: stylishProfile
};

const defaultProfilesNames = ['loopingVideo', 'videoStream', 'stylish'];

export const getDefaultProfile = async (profileName) => {
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
