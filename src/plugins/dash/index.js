import videojs from 'video.js';

export default async function dashPlugin() {

  // ToDo: consider going back to public `videojs-contrib-dash` now that it is being maintained again
  await import(/* webpackChunkName: "dash" */ './videojs-dash');

  const djs = window.dashjs;

  const dashInit = (player, mediaPlayer) => {
    // eslint-disable-next-line new-cap
    mediaPlayer = djs.MediaPlayer().create();

    mediaPlayer.on(djs.MediaPlayer.events.PLAYBACK_STALLED, data => {
      console.warn('PLAYBACK_STALLED', data);
    });
  };

  // Triggered on 'beforeinitialize'
  videojs.Html5DashJS.hook('beforeinitialize', dashInit);

  return Promise.resolve();
}
