import { findIndex } from 'utils/find';

class EventHandlerRegistry {
  constructor(emitter) {
    this._emitter = emitter;
    this._eventHandlers = [];
  }

  on(type, handler) {
    this._eventHandlers.push({ type, handler });
    this._emitter.on(type, handler);
  }

  one(type, handler) {
    const wrapper = (...args) => {
      handler(...args);
      this.off(type, handler);
    };

    this._eventHandlers.push({ type, handler, wrapper });
    this._emitter.one(type, handler);
  }

  off(type, handler) {
    const index = findIndex(this._eventHandlers, (event) =>
      event.type === type && event.handler === handler);

    if (index === -1) {
      return;
    }

    const event = this._eventHandlers[index];

    this._emitter.off(type, event.wrapper || event.handler);

    this._eventHandlers.splice(index, 1);
  }

  removeAllListeners() {
    this._eventHandlers.forEach((event) => {
      this.off(event);
    });
  }
}

export default EventHandlerRegistry;
