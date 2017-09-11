import videojs from 'video.js';

const VolumeMenuButton = videojs.getComponent('VolumeMenuButton');
const VolumeBar = videojs.getComponent('TriangleVolumeBar');
const Popup = videojs.getComponent('Popup');

class TriangleVolumeMenuButton extends VolumeMenuButton {
  createPopup() {
    const popup = new Popup(this.player_, {
      contentElType: 'div'
    });

    const vb = new VolumeBar(this.player_, this.options_.volumeBar);

    popup.addChild(vb);

    this.menuContent = popup;
    this.volumeBar = vb;

    this.attachVolumeBarEvents();

    return popup;
  }
}

videojs.registerComponent('TriangleVolumeMenuButton', TriangleVolumeMenuButton);

export default TriangleVolumeMenuButton;
