import videojs from 'video.js';

function sourceSwitcher(options) {
  const player = this;
  player.ready(() => {
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
    button.setItems(items, false);
    button.setOnSelected(({ index }) => {
      options.onSourceChange(options.sources[index]);
    });

    // initial set
    button.setSelected(options.sourcesInitialSelectedIndex);
  });
}

export default sourceSwitcher;
