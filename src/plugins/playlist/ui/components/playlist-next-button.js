import PlaylistButton from './playlist-button';
import videojs from 'video.js';

class PlaylistNextButton extends PlaylistButton {

  constructor(player) {
    super(player, { type: 'next' });
  }

  handleClick(event) {
    event.stopPropagation();
    super.handleClick(event);
    this.player().cloudinary.playlist().playNext();
  }
}

videojs.registerComponent('PlaylistNextButton', PlaylistNextButton);

export default PlaylistNextButton;
