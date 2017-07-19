import videojs from 'video.js'
import ContextMenuItem from './context-menu-item'

const Menu = videojs.getComponent('Menu')

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs

class ContextMenu extends Menu {
  constructor(player, options) {
    super(player, options)

    // Each menu component has its own `dispose` method that can be
    // safely bound and unbound to events while maintaining its context.
    this.dispose = videojs.bind(this, this.dispose)

    options.content.forEach(c => {
      let fn = null

      if (typeof c.listener === 'function') {
        fn = c.listener
      } else if (typeof c.href === 'string') {
        fn = () => window.open(c.href)
      } else {
        fn = () => true
      }

      const that = this

      this.addItem(new ContextMenuItem(player, {
        label: c.label,
        listener: videojs.bind(player, function() {
          fn(this)
          window.setTimeout(() => {
            that.dispose()
          }, 1)
        })
      }))
    })
  }

  createEl() {
    const el = super.createEl()

    dom.addClass(el, 'vjs-context-menu')
    el.style.left = `${this.options_.position.left}px`
    el.style.top = `${this.options_.position.top}px`

    return el
  }
}

export default ContextMenu
