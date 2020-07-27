
const playButton = (elem, options) => {
  if (options.bigPlayButton === 'init') {
    elem.classList.add('vjs-big-play-button-init-only');
    options.bigPlayButton = true;
  }
};

export { playButton };
