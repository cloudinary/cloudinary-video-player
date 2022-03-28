import Playlist from 'components/playlist/playlist';
import Promise from 'promise-polyfill';
import fetchPF from 'fetch-ponyfill/build/fetch-browser';
import { sliceProperties } from 'utils/slicing';
import { normalizeJsonResponse } from 'utils/api';
import { assign } from 'utils/assign';
import { extendCloudinaryConfig, getCloudinaryUrl } from '../plugins/cloudinary/common';

const { fetch } = fetchPF({ Promise });

const LIST_BY_TAG_PARAMS = { format: 'json', resource_type: 'video', type: 'list' };

const Playlistable = (superclass) => class extends superclass {

  constructor(player, options = {}) {
    super();

    const _chainTarget = sliceProperties(options, 'chainTarget').chainTarget;
    let _playlist = null;
    let _playlistDisposer = null;

    this.playlist = (sources, options = {}) => {
      if (sources === undefined) {
        return _playlist;
      }

      if (this.playlist()) {
        this.disposePlaylist();
      }

      createPlaylist(sources, options);
      player.trigger('playlistcreated');

      return _chainTarget;
    };

    this.disposePlaylist = () => {
      player.removeClass('vjs-playlist');
      const playlist = this.playlist();
      _playlist = undefined;
      playlist.dispose();
      this.off('cldsourcechanged', _playlistDisposer);
    };

    const createPlaylist = (sources, options) => {
      if (sources instanceof Playlist) {
        _playlist = sources;
        _playlist.resetState();
        _playlist.currentIndex(_playlist.currentIndex());
      } else {
        _playlist = new Playlist(this, sources, options);
        _playlist.currentIndex(0);
      }

      _playlistDisposer = addSourceChangedListener();
      player.addClass('vjs-playlist');
    };

    const addSourceChangedListener = () => {
      const disposer = () => {
        if (this.playlist() &&
          !this.playlist().currentSource().contains(this.player.currentSource())) {
          this.disposePlaylist();
        }
      };

      this.on('cldsourcechanged', disposer);

      return disposer;
    };
  }

  playlistByTag(tag, options = {}) {
    return this.sourcesByTag(tag, options)
      .then((sources) => this.playlist(sources, options));
  }

  sourcesByTag(tag, options = {}) {
    const url = getCloudinaryUrl(tag, extendCloudinaryConfig(this.cloudinaryConfig(), LIST_BY_TAG_PARAMS));

    return fetch(url)
      .then((result) => result.json())
      .then((json) => {
        const resources = normalizeJsonResponse(json.resources);

        if (options.sorter) {
          resources.sort(options.sorter);
        }

        const sources = resources.map((resource) => {
          let sourceParams = options.sourceParams || {};

          if (typeof sourceParams === 'function') {
            sourceParams = sourceParams(resource);
          }

          const info = resource.context && resource.context.custom || {};

          const source = assign({ info }, sourceParams, { publicId: resource.publicId });
          return this.buildSource(source);
        });

        return sources;
      });
  }
};

export default Playlistable;
