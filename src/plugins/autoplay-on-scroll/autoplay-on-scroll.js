import autobind from 'utils/autobind'
import { isElementInViewport } from 'utils/positioning'
import { sliceProperties } from 'utils/slicing'

const defaults = {
  fraction: 0.5,
  isMuted: true
}

class AutoplayOnScrollPlugin {
  constructor(player, opts = {}) {
    opts = Object.assign({}, defaults, opts)

    this.player = player
    this.pausedByScroll = false
    this.playedByScroll = false
    this.options = sliceProperties(opts, 'fraction')

    autobind(this)
  }

  init() {
    this.registerEventHandlers()
    this.checkViewportState()
  }

  registerEventHandlers() {
    // TODO: find a better replacement for 'pause' since it's being triggered
    // by 'buffering' as well.
    this.pauseHandler = () => {
      if (!this.player.waiting && !this.pausedByScroll) {
        this.clearEventHandlers()
      }
    }

    this.playHandler = () => {
      if (!this.playedByScroll) {
        this.clearEventHandlers()
      }
    }

    window.addEventListener('DOMContentLoaded', this.checkViewportState, false)
    window.addEventListener('load', this.checkViewportState, false)
    window.addEventListener('scroll', this.checkViewportState, false)
    window.addEventListener('resize', this.checkViewportState, false)
    this.player.on('pause', this.pauseHandler)
    this.player.on('play', this.playHandler)
  }

  clearEventHandlers() {
    window.removeEventListener('DOMContentLoaded', this.checkViewportState, false)
    window.removeEventListener('load', this.checkViewportState, false)
    window.removeEventListener('scroll', this.checkViewportState, false)
    window.removeEventListener('resize', this.checkViewportState, false)
    this.player.off('pause', this.pauseHandler)
    this.player.off('play', this.playHandler)
  }

  pause() {
    this.pausedByScroll = true
    this.playedByScroll = false
    this.player.pause()
  }

  play() {
    this.pausedByScroll = false
    this.playedByScroll = true
    this.player.play()
  }

  checkViewportState() {
    const visible = isElementInViewport(this.player.el(), { fraction: this.options.fraction })

    if (visible) {
      if (this.player.paused()) {
        this.play()
      }
    } else if (!this.player.paused()) {
      this.pause()
    }
  }
}

export default function(opts = {}) {
  new AutoplayOnScrollPlugin(this, opts).init()
}
