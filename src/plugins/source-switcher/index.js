import videojs from 'video.js';

function sourceSwitcher() {
  const player = this;

  const reInit = (options) => {
    const button = player
      .getChild('controlBar')
      .getChild('sourceSwitcherButton');

    if (!button) {
      videojs.log.warn('SourceSwitcherButton not found in controlBar.');
      return;
    }

    const items = options.sources.map((source) => ({
      value: source.publicId,
      label: source.label || source.publicId,
    }));

    button.setItems(items);
    // clear callback before selecting initial element
    button.setOnSelected(() => {});
    button.setSelected(options.selectedIndex);
    button.setOnSelected(({ index }) => {
      options.onSourceChange(options.sources[index]);
    });
  };

  return {
    reInit,
  };
}

export default sourceSwitcher;
