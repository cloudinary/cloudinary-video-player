/**
 * Sets up event methods (on, one, off, trigger) on the VideoPlayer instance.
 * These methods wrap Video.js event methods and add the Player context to events.
 *
 * @param {Object} player - The VideoPlayer instance
 * @param {Object} videojsInstance - The underlying Video.js player instance
 */
const setupEventMethods = (player, videojsInstance) => {
  const handlers = {};

  player.on = (...args) => {
    const lastIndex = args.length - 1;
    const func = args[lastIndex];

    handlers[func] = (event, ..._args) => {
      event.Player = player;
      func(event, ..._args);
    };

    args[lastIndex] = handlers[func];

    return videojsInstance.on(...args);
  };

  player.one = (...args) => {
    const lastIndex = args.length - 1;
    const func = args[lastIndex];

    handlers[func] = (event, ..._args) => {
      event.Player = player;
      func(event, ..._args);
      delete handlers[func];
    };

    args[lastIndex] = handlers[func];

    return videojsInstance.one(...args);
  };

  player.off = (...args) => {
    const lastIndex = args.length - 1;
    const func = args[lastIndex];

    args[lastIndex] = handlers[func];

    const res = videojsInstance.off(...args);
    delete handlers[func];

    return res;
  };

  player.trigger = (...args) => {
    videojsInstance.trigger(...args);
  };
};

export default setupEventMethods;

