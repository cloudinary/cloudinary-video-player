import { fetchWithTimeout } from '../../utils/fetch-with-timeout';

import cldDefaultProfile from '../../profiles/cldDefault.json';
import cldLoopingProfile from '../../profiles/cldLooping.json';
import cldAdaptiveStreamProfile from '../../profiles/cldAdaptiveStream.json';

const defaultProfiles = {
  cldDefault: cldDefaultProfile,
  cldLooping: cldLoopingProfile,
  cldAdaptiveStream: cldAdaptiveStreamProfile
};

export const getProfile = async (cloudName, profile, timeout = 100) => {
  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  return await fetchWithTimeout(profile, {
    method: 'GET',
    timeout
  }).then(res => res.json());
};
