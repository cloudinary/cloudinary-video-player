const Eventable = (superclass) => class extends superclass {
  constructor() {
    super();

    const eventable = { data: {}, handlers: {} };

    this.on = (...args) => {
      const lastIndex = args.length - 1;
      const func = args[lastIndex];

      eventable.handlers[func] = (event, ..._args) => {
        event.Player = this;
        func(event, ..._args);
      };

      args[lastIndex] = eventable.handlers[func];

      return this.videojs.on(...args);
    };

    this.one = (...args) => {
      const lastIndex = args.length - 1;
      const func = args[lastIndex];

      eventable.handlers[func] = (event, ..._args) => {
        event.Player = this;
        func(event, ..._args);
        delete eventable.handlers[func];
      };

      args[lastIndex] = eventable.handlers[func];

      return this.videojs.one(...args);
    };

    this.off = (...args) => {
      const lastIndex = args.length - 1;
      const func = args[lastIndex];

      args[lastIndex] = eventable.handlers[func];

      const res = this.videojs.off(...args);
      delete eventable.handlers[func];

      return res;
    };

    this.trigger = (...args) => {
      this.videojs.trigger(...args);
    };
  }
};

export default Eventable;
