import { getCloudinaryUrl } from '../../plugins/cloudinary/common';
import defaultProfile1 from '../../profiles/default_profile1.json';
import defaultProfile2 from '../../profiles/default_profile2.json';

const defaultProfiles = {
  'defaultProfile1': defaultProfile1,
  'defaultProfile2': defaultProfile2
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

// initially we don't have BE ready so try to take profile from cloud
export const getProfile = async (cloudName, profileName, timeout = 10000) => {
  if (defaultProfiles[profileName]) {
    return defaultProfiles[profileName];
  }

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
    cache: 'default',
    timeout
  });
  return await response.json();
};
