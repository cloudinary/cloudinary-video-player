import Playlist from '../playlist';
import Promise from 'promise-polyfill';
import fetchPF from 'fetch-ponyfill/build/fetch-browser';
import { sliceProperties } from 'utils/slicing';
import { normalizeJsonResponse } from 'utils/api';
import assign from 'utils/assign';
import '../components/playlist';
import '../components/upcoming-video-overlay';

const { fetch } = fetchPF({ Promise });

const LIST_BY_TAG_PARAMS = { format: 'json', resource_type: 'video', type: 'list' };

const Playlistable = (superclass) => class extends superclass {
  constructor(player, options = {}) {
    super();

    const _chainTarget = sliceProperties(options, 'chainTarget').chainTarget;
    let _playlist = null;
    let _playlistDisposer = null;

    // playlist(['oceans', 'book', 'dog'])
    // playlist([{ publicId: 'oceans', { transformation: { width: 50, height: 100, crop: 'limit } }, 'book', 'dog'])
    this.playlist = (sources, options = {}) => {
      if (sources === undefined) {
        return _playlist;
      }

      if (this.playlist()) {
        disposePlaylist();
      }

      createPlaylist(sources, options);
      player.trigger('playlistcreated');

      return _chainTarget;
    };

    const createPlaylist = (sources, options) => {
      _playlist = new Playlist(this, sources, options);

      _playlistDisposer = addSourceChangedListener();
      player.addClass('vjs-playlist');
    };

    const disposePlaylist = () => {
      player.removeClass('vjs-playlist');
      const playlist = this.playlist();
      _playlist = undefined;
      playlist.dispose();
      this.off('sourcechanged', _playlistDisposer);
    };

    const addSourceChangedListener = () => {
      const disposer = (_, data) => {
        if (!this.playlist().currentSource().contains(data.to)) {
          disposePlaylist();
        }
      };

      this.on('sourcechanged', disposer);

      return disposer;
    };
  }

  playlistByTag(tag, options = {}) {
    return this.sourcesByTag(tag, options)
      .then((sources) => this.playlist(sources, options));
  }

  sourcesByTag(tag, options = {}) {
    const url = this.cloudinaryConfig().url(tag, LIST_BY_TAG_PARAMS);

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
