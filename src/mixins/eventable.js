const Eventable = (superclass) => class extends superclass {
  on(...args) {
    const lastIndex = args.length - 1
    const func = args[lastIndex]

    this._eventable().handlers[func] = (event, ..._args) => {
      event.Player = this
      func(event, ..._args)
    }

    args[lastIndex] = this._eventable().handlers[func]

    return this.videojs.on(...args)
  }

  one(...args) {
    const lastIndex = args.length - 1
    const func = args[lastIndex]

    this._eventable().handlers[func] = (event, ..._args) => {
      event.Player = this
      func(event, ..._args)
      delete this._eventable().handlers[func]
    }

    args[lastIndex] = this._eventable().handlers[func]

    return this.videojs.one(...args)
  }

  off(...args) {
    const lastIndex = args.length - 1
    const func = args[lastIndex]

    args[lastIndex] = this._eventable.handlers[func]

    const res = this.videojs.off(...args)
    delete this._eventable.handlers[func]

    return res
  }

  trigger(...args) {
    return this.videojs.trigger(...args)
  }

  _eventable() {
    if (!this.__eventable) {
      this.__eventable = { data: {}, handlers: {} }
    }

    return this.__eventable
  }
}

export default Eventable
