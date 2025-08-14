import { sliceProperties } from 'utils/slicing';
import { PLAYER_EVENT } from 'utils/consts';
import { getCloudinaryUrl } from 'plugins/cloudinary/common';
import { normalizeJsonResponse } from './utils/api';

import Playlist from './ui/playlist';
import PlaylistWidget from './ui/playlist-widget';
import './ui/panel/playlist-panel';

const LIST_BY_TAG_PARAMS = { format: 'json', resource_type: 'video', type: 'list' };

const playlist = (player, options = {}) => {
  const chainTarget = sliceProperties(options, 'chainTarget').chainTarget;
  let playlistInstance = null;
  let playlistDisposer = null;
  let playlistWidget = null;

  const initPlaylistWidget = () => {
    player.on(PLAYER_EVENT.PLAYLIST_CREATED, () => {
      if (playlistWidget) {
        playlistWidget.dispose();
      }

      if (options.playlistWidget?.show != false) {
        if (player.fluid_) {
          options.playlistWidget.fluid = true;
        }

        if (player.cloudinary.fontFace) {
          options.playlistWidget.fontFace = player.cloudinary.fontFace;
        }

        playlistWidget = new PlaylistWidget(player, options.playlistWidget);
      }
    });
  };

  const disposePlaylist = () => {
    player.removeClass('vjs-playlist');
    playlistInstance = undefined;
    player.playlist().dispose();
    player.off('cldsourcechanged', playlistDisposer);
  };

  const addPlaylistDisposer = () => {
    const disposer = () => {
      if (
        playlistInstance &&
        !playlistInstance.currentSource().contains(player.currentSource())
      ) {
        player.disposePlaylist();
      }
    };

    player.on('cldsourcechanged', disposer);

    return disposer;
  };

  const createPlaylist = (sources, options) => {
    if (sources instanceof Playlist) {
      playlistInstance = sources;
      playlistInstance.resetState();
      playlistInstance.currentIndex(playlistInstance.currentIndex());
    } else {
      playlistInstance = new Playlist(player.cloudinary, sources, options);
      playlistInstance.currentIndex(0);
    }

    initPlaylistWidget();

    playlistDisposer = addPlaylistDisposer();
    player.addClass('vjs-playlist');
  };

  player.cloudinary.sourcesByTag = async (tag, options = {}) => {
    const url = getCloudinaryUrl(
      tag,
      Object.assign({}, player.cloudinary.cloudinaryConfig(), LIST_BY_TAG_PARAMS)
    );

    const result = await fetch(url);
    const json = await result.json();

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

      const source = Object.assign({ info }, sourceParams, { publicId: resource.publicId });

      return player.cloudinary.buildSource(source);
    });

    return sources;
  };

  return (sources, options = {}) => {
    if (sources === undefined) {
      return playlistInstance;
    }

    if (playlistInstance) {
      disposePlaylist();
    }

    createPlaylist(sources, options);
    player.trigger('playlistcreated');

    return chainTarget;
  };
};

export default playlist;
