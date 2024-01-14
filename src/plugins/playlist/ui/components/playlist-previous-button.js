import PlaylistButton from './playlist-button';
import videojs from 'video.js';

class PlaylistPreviousButton extends PlaylistButton {

  constructor(player) {
    super(player, { type: 'previous' });
  }

  handleClick(event) {
    super.handleClick(event);
    this.player().cloudinary.playlist().playPrevious();
  }
}

videojs.registerComponent('PlaylistPreviousButton', PlaylistPreviousButton);

export default PlaylistPreviousButton;
