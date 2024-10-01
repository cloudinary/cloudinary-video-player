import VideoPlayer from './video-player';
import { defaultProfiles } from './config/profiles';
import { isRawUrl } from './plugins/cloudinary/common';
import { unsigned_url_prefix } from '@cloudinary/url-gen/backwards/utils/unsigned_url_prefix';

export const getProfile = async (profile, initOptions) => {
  if (Object.keys(defaultProfiles).includes(profile)) {
    return defaultProfiles[profile];
  }

  const urlPrefix = unsigned_url_prefix(
    null,
    initOptions.cloudName || initOptions.cloud_name,
    initOptions.private_cdn,
    initOptions.cdn_subdomain,
    initOptions.secure_cdn_subdomain,
    initOptions.cname,
    initOptions.secure,
    initOptions.secure_distribution,
  );

  const profileUrl = isRawUrl(profile) ? profile : `${urlPrefix}/_applet_/video_service/video_player_profiles/${profile}.json`;
  return await fetch(profileUrl, { method: 'GET' }).then(res => res.json());
};

const player = async (elem, initOptions, ready) => {
  const { profile, ...otherInitOptions } = initOptions;
  try {
    const profileOptions = profile ? await getProfile(profile, otherInitOptions) : {};
    const options = Object.assign({}, profileOptions.playerOptions, otherInitOptions);
    const videoPlayer = new VideoPlayer(elem, options, ready);

    const nativeVideoPlayerSourceMethod = videoPlayer.source;
    videoPlayer.source = (id, options) => {
      const extendedOptions = Object.assign({}, profileOptions.sourceOptions, options);
      return nativeVideoPlayerSourceMethod.call(videoPlayer, id, extendedOptions);
    };

    return videoPlayer;
  } catch (e) {
    const videoPlayer = new VideoPlayer(elem, otherInitOptions);
    videoPlayer.videojs.error('Invalid profile');
    throw e;
  }
};

export default player;
