import { getCloudinaryUrl } from '../../plugins/cloudinary/common';

import loopingVideoDefaultProfile from '../../profiles/loopingVideo.json';
import videoStreamDefaultProfile from '../../profiles/videoStream.json';
import stylishDefaultProfile from '../../profiles/stylish.json';

const defaultProfiles = {
  loopingVideo: loopingVideoDefaultProfile,
  videoStream: videoStreamDefaultProfile,
  stylish: stylishDefaultProfile
};
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
}

export const getDefaultProfile = (cloudName, profileName) => {
  if (defaultProfiles[profileName]) {
    return defaultProfiles[profileName];
  }

  throw new Error(`Default profile ${profileName} does not exist`);
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
  if (defaultProfiles[profileName]) {
    return getDefaultProfile(profileName);
  }

  return await getCustomProfile(cloudName, profileName, timeout);
};
