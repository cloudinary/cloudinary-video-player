import videojs from 'video.js';
import djs from 'dashjs';
// eslint-disable-next-line no-unused-vars
import Html5DashJS from 'plugins/dash/videojs-dash';

export default function dashPlugin() {

  const dashInit = (player, mediaPlayer) => {
    // eslint-disable-next-line new-cap
    mediaPlayer = djs.MediaPlayer().create();
    let settings = {
      streaming: {
        liveDelayFragmentCount: null
      }
    };
    mediaPlayer.updateSettings(settings);
    mediaPlayer.on(djs.MediaPlayer.events.PLAYBACK_STALLED, (a) => {
      console.log(a);
      console.log('stalled');
    });
  };

  // Triggered on 'beforeinitialize'
  videojs.Html5DashJS.hook('beforeinitialize', dashInit);

}
