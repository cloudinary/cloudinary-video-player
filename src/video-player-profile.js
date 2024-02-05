import VideoPlayer from './video-player';

class VideoPlayerProfile {
  constructor(elem, initOptions, ready) {
    if (!initOptions.profile) {
      throw new Error('VideoPlayerProfile method requires "profile" property');
    }

    return this.initPlayer(initOptions)
      .then((profileOptions) => this.getEnrichedVideoPlayer(elem, initOptions, profileOptions, ready))
      .catch((e) => {
        const videoPlayer = new VideoPlayer(elem, initOptions);
        videoPlayer.videojs.error('Invalid profile');
        throw e;
      });
  }

  async initPlayer(initOptions) {
    const { getProfile } = await import(/* webpackChunkName: "profiles/profilesComponent" */ './components/profiles/profiles');
    const profileOptions = await getProfile(initOptions.cloud_name, initOptions.profile);
    this.profileOptions = profileOptions;
    return profileOptions;
  }

  getEnrichedVideoPlayer(elem, initOptions, profileOptions, ready) {
    const options = Object.assign({}, profileOptions.playerOptions, initOptions);
    const videoPlayer = new VideoPlayer(elem, options, ready);

    videoPlayer.source = this.createMethodWithOptions(
      videoPlayer,
      videoPlayer.source,
      this.profileOptions.sourceOptions
    );

    videoPlayer.playlist = this.createMethodWithOptions(
      videoPlayer,
      videoPlayer.playlist,
      this.profileOptions.playlistOptions
    );

    videoPlayer.playlistByTag = this.createMethodWithOptions(
      videoPlayer,
      videoPlayer.playlistByTag,
      this.profileOptions.playlistByTagOptions
    );

    videoPlayer.sourcesByTag = this.createMethodWithOptions(
      videoPlayer,
      videoPlayer.sourcesByTag,
      this.profileOptions.sourcesByTagOptions
    );

    return videoPlayer;
  }

  createMethodWithOptions = (vpInstance, nativeMethod, methodProfileOptions) => (id, options = {}, ...restArgs) => {
    const extendedOptions = Object.assign({}, methodProfileOptions, options);
    return nativeMethod.call(vpInstance, id, extendedOptions, ...restArgs);
  };
}

export default VideoPlayerProfile;
