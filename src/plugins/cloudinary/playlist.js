const DEFAULT_AUTO_ADVANCE = 0

class Playlist {
  constructor(context, sources = [], { repeat = false, autoAdvance = false } = {}) {
    this._context = context
    this._sources = []
    sources.forEach((source) => this.enqueue(source))

    this.repeat(repeat)
    this.autoAdvance(autoAdvance)
    this.currentIndex(0)
  }

  playAtIndex(index) {
    this.currentIndex(index)
    this.player().play()

    return this.currentSource()
  }

  currentIndex(index) {
    if (arguments.length <= 0) {
      return this._currentIndex
    }

    if (index >= this.length() || index < 0) {
      throw new Error('Invalid playlist index.')
    }

    this._currentIndex = index
    const current = this.currentSource()
    this._context.source(current)

    this._setup()

    return current
  }

  currentSource() {
    return this.list()[this.currentIndex()]
  }

  list() {
    return this._sources
  }

  enqueue(source, options = {}) {
    const src = source.constructor.name === 'VideoSource' ? source
      : this._buildSource(source, options)

    this._sources.push(src)

    return src
  }

  removeAt(index) {
    if (index >= this.length() || index < 0) {
      throw new Error('Invalid playlist index.')
    }

    this._sources.splice(index, 1)

    return this
  }

  repeat(repeat) {
    if (arguments.length <= 0) {
      return this._repeat
    }

    this._repeat = !!repeat

    return this._repeat
  }

  playFirst() {
    return this.playAtIndex(0)
  }

  playLast() {
    const lastIndex = this.list().length - 1
    return this.playAtIndex(lastIndex)
  }

  isLast() {
    return this.currentIndex() >= this.length() - 1
  }

  isFirst() {
    return this.currentIndex() === 0
  }

  length() {
    return this.list().length
  }

  playNext() {
    const currentIndex = this.currentIndex()
    let nextIndex = currentIndex + 1

    if (this.isLast()) {
      if (this.repeat()) {
        nextIndex = 0
      } else {
        return null
      }
    }

    return this.playAtIndex(nextIndex)
  }

  playPrevious() {
    const currentIndex = this.currentIndex()
    return this.playAtIndex(currentIndex - 1)
  }

  player() {
    return this._context.player
  }

  autoAdvance(delay) {
    this._autoAdvance = this._autoAdvance || {}

    if (arguments.length <= 0) {
      return this._autoAdvance.delay
    }

    if (delay === true) {
      delay = DEFAULT_AUTO_ADVANCE
    } else if (delay === false) {
      delay = false
    } else if (!Number.isInteger(delay) || delay < 0) {
      throw new Error('Auto advance \'delay\' must be either a boolean or a positive integer.')
    }

    this._autoAdvance.delay = delay

    this._setup()

    return this._autoAdvance.delay
  }

  dispose() {
    this._resetAutoAdvance()
  }

  _buildSource(source, options = {}) {
    return this._context._buildSource(source, options)
  }

  _setup() {
    this._resetAutoAdvance()

    const delay = this._autoAdvance.delay

    if (delay === false) {
      return this._chainTarget
    }

    const trigger = () => {
      console.log('triggered ended')
      this._autoAdvance.timeout = setTimeout(() => {
        this.playNext()
      }, delay * 1000)
    }

    this._autoAdvance = { delay, trigger }
    this._playerEvents().one('ended', this._autoAdvance.trigger)
  }

  _playerEvents() {
    return this._context._playerEvents
  }

  _resetAutoAdvance() {
    if (!this._autoAdvance) {
      this._autoAdvance = {}
    }

    if (this._autoAdvance.timeout) {
      clearTimeout(this._autoAdvance.timeout)
    }

    if (this._autoAdvance.trigger) {
      this._playerEvents().off('ended', this._autoAdvance.trigger)
    }

    this._autoAdvance.timeout = null
    this._autoAdvance.trigger = null
  }
}

export default Playlist
