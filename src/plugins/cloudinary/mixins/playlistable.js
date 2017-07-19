import Playlist from '../playlist'
import Promise from 'promise-polyfill'
import fetchPF from 'fetch-ponyfill/build/fetch-browser'
import { normalizeJsonResponse } from 'utils/api'

const { fetch } = fetchPF(Promise)

const LIST_BY_TAG_PARAMS = { format: 'json', resource_type: 'video', type: 'list' }

const Playlistable = (superclass) => class extends superclass {
  // playlist(['oceans', 'book', 'dog'])
  // playlist([{ publicId: 'oceans', { transformation: { width: 50, height: 100, crop: 'limit } }, 'book', 'dog'])
  playlist(sources, options = {}) {
    if (!sources) {
      return this._playlist
    }

    if (this.playlist()) {
      this._disposePlaylist()
    }

    this._createPlaylist(sources, options)

    return this._chainTarget
  }

  playlistByTag(tag, options = {}) {
    return this.sourcesByTag(tag, options)
      .then((sources) => this.playlist(sources, options))
  }

  sourcesByTag(tag, options = {}) {
    const url = this.cloudinaryConfig().url(tag, LIST_BY_TAG_PARAMS)

    return fetch(url)
      .then((result) => result.json())
      .then((json) => {
        const resources = normalizeJsonResponse(json.resources)

        if (options.sorter) {
          resources.sort(options.sorter)
        }

        const sources = resources.map((resource) => {
          let sourceParams = options.sourceParams || {}

          if (typeof sourceParams === 'function') {
            sourceParams = sourceParams(resource)
          }

          const source = Object.assign({}, sourceParams, { publicId: resource.publicId })
          return this._buildSource(source)
        })

        return sources
      })
  }

  _createPlaylist(sources, options) {
    this._playlist = new Playlist(this, sources, options)
    this._playlistDisposer = addSourceChangedListener(this)
  }

  _disposePlaylist() {
    const playlist = this.playlist()
    this._playlist = undefined
    playlist.dispose()
    this._playerEvents.off('sourcechanged', this._playlistDisposer)
  }
}

const addSourceChangedListener = (context) => {
  const disposer = (_, data) => {
    if (!context.playlist().currentSource().contains(data.to)) {
      context._disposePlaylist()
    }
  }

  context._playerEvents.on('sourcechanged', disposer)

  return disposer
}

export default Playlistable
