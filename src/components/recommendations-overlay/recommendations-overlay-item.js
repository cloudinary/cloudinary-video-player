import videojs from 'video.js';

const ClickableComponent = videojs.getComponent('ClickableComponent');

class RecommendationsOverlayItem extends ClickableComponent {

  setItem(item) {
    const { action, source } = item;
    this.source = source;

    const info = source.info();

    this.setTitle(info.title || source.publicId());

    this.setPoster(this.source.poster().url({ transformation: { aspect_ratio: '16:9', crop: 'pad', background: 'black' } }));

    this.setAction(action);
  }

  setTitle(text) {
    this.title.innerText = text;
  }

  setAction(action) {
    this.action = action;
  }

  handleClick() {
    super.handleClick();
    this.player().trigger('recommendationshide');
    this.action();
  }
}

export default RecommendationsOverlayItem;
