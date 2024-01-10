import { sliceProperties } from 'utils/slicing';
import { normalizeJsonResponse } from 'utils/api';
import { assign } from 'utils/assign';
import { PLAYER_EVENT } from 'utils/consts';
import { isPlainObject } from 'utils/type-inference';
import { extendCloudinaryConfig, getCloudinaryUrl } from 'plugins/cloudinary/common';

import Playlist from './ui/playlist';
import PlaylistWidget from './ui/playlist-widget';
import './ui/panel/playlist-panel';

const LIST_BY_TAG_PARAMS = { format: 'json', resource_type: 'video', type: 'list' };

const playlist = (player, options = {}) => {
  const _chainTarget = sliceProperties(options, 'chainTarget').chainTarget;
  let _playlist = null;
  let _playlistDisposer = null;
  let _playlistWidget = null;

  const disposePlaylist = () => {
    player.removeClass('vjs-playlist');
    const playlist = player.playlist();
    _playlist = undefined;
    playlist.dispose();
    player.off('cldsourcechanged', _playlistDisposer);
  };

  const createPlaylist = (sources, options) => {
    if (sources instanceof Playlist) {
      _playlist = sources;
      _playlist.resetState();
      _playlist.currentIndex(_playlist.currentIndex());
    } else {
      _playlist = new Playlist(player.cloudinary, sources, options);
      _playlist.currentIndex(0);
    }

    initPlaylistWidget();

    _playlistDisposer = addSourceChangedListener();
    player.addClass('vjs-playlist');
  };

  const addSourceChangedListener = () => {
    const disposer = async () => {
      if (
        _playlist &&
        !_playlist.currentSource().contains(player.currentSource())
      ) {
        player.disposePlaylist();
      }
    };

    player.on('cldsourcechanged', disposer);

    return disposer;
  };

  const initPlaylistWidget = () => {
    player.on(PLAYER_EVENT.PLAYLIST_CREATED, () => {
      if (_playlistWidget) {
        _playlistWidget.dispose();
      }

      if (isPlainObject(options.playlistWidget)) {
        if (player.fluid_) {
          options.playlistWidget.fluid = true;
        }

        if (player.cloudinary.fontFace) {
          options.playlistWidget.fontFace = player.cloudinary.fontFace;
        }

        _playlistWidget = new PlaylistWidget(player, options.playlistWidget);
      }
    });
  };

  player.cloudinary.sourcesByTag = (tag, options = {}) => {
    const url = getCloudinaryUrl(
      tag,
      extendCloudinaryConfig(player.cloudinary.cloudinaryConfig(), LIST_BY_TAG_PARAMS)
    );

    return fetch(url)
      .then(result => result.json())
      .then(json => {
        const resources = normalizeJsonResponse(json.resources);

        if (options.sorter) {
          resources.sort(options.sorter);
        }

        const sources = resources.map(resource => {
          let sourceParams = options.sourceParams || {};

          if (typeof sourceParams === 'function') {
            sourceParams = sourceParams(resource);
          }

          const info = (resource.context && resource.context.custom) || {};

          const source = assign({ info }, sourceParams, { publicId: resource.publicId });

          return player.cloudinary.buildSource(source);
        });

        return sources;
      });
  };

  return (sources, options = {}) => {
    if (sources === undefined) {
      return _playlist;
    }

    if (_playlist) {
      disposePlaylist();
    }

    createPlaylist(sources, options);
    player.trigger('playlistcreated');

    return _chainTarget;
  };
};

export default playlist;
