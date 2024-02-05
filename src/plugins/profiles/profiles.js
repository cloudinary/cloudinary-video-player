import cldDefaultProfile from '../../config/profiles/cldDefault.json';
import cldLoopingProfile from '../../config/profiles/cldLooping.json';
import cldAdaptiveStreamProfile from '../../config/profiles/cldAdaptiveStream.json';

const defaultProfiles = {
  cldDefault: cldDefaultProfile,
  cldLooping: cldLoopingProfile,
  cldAdaptiveStream: cldAdaptiveStreamProfile
};

export const getProfile = async (cloudName, profile) => {
  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  return await fetch(profile, { method: 'GET' }).then(res => res.json());
};
