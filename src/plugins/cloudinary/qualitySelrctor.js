import * as djs from 'dashjs';

export default (player) => {
  if (player && player.qualityLevels && player.dash && player.dash.mediaPlayer) {
    const MediaPlayer = djs.default.MediaPlayer;
    player.dash.qualityLevels = player.qualityLevels();
    // player.dash.mediaPlayer.updateSettings({ 'debug': { 'logLevel': 5 } });

    player.dash.mediaPlayer.on(MediaPlayer.events.PLAYBACK_METADATA_LOADED, () => {
      let videoRates = player.dash.mediaPlayer.getBitrateInfoListFor('video');
      let audioRates = player.dash.mediaPlayer.getBitrateInfoListFor('audio');

      let normalizeFactor = videoRates[videoRates.length - 1].bitrate;
      player.dash.audioMapper = videoRates.map((rate) => Math.round((rate.bitrate / normalizeFactor) * (audioRates.length - 1)));
      player.dash.mediaPlayer.getDebug().setLogLevel(4);

      videoRates.forEach((vrate) => {
        player.dash.qualityLevels.addQualityLevel({
          id: vrate.bitrate,
          width: vrate.width,
          height: vrate.height,
          bandwidth: vrate.bitrate,
          enabled: function(val) {
            if (val !== undefined) {
              player.dash.enabled = val;
            } else {
              return player.dash.enabled !== undefined ? player.dash.enabled : true;
            }
          }
        });

      });
    });
    player.dash.mediaPlayer.on(MediaPlayer.events.QUALITY_CHANGE_REQUESTED, (event) => {
      console.log('change request');
      console.log(event);
    });

    player.qualityLevels().on('change', (event) => {
      console.log(event);
      console.log(player.dash.qualityLevels.selectedIndex);
      let enabledQualities = player.dash.qualityLevels.levels.filter((q) => q.enabled);

      if (enabledQualities.length === 1) {
        if (player.dash.mediaPlayer.getAutoSwitchQualityFor('video')) {
          player.dash.mediaPlayer.setAutoSwitchQualityFor('video', false);
          player.dash.mediaPlayer.setAutoSwitchQualityFor('audio', false);
        }
        player.dash.mediaPlayer.setQualityFor('video', event.selectedIndex);
        player.dash.mediaPlayer.setQualityFor('audio', player.dash.audioMapper[event.selectedIndex]);
      } else if (!player.dash.mediaPlayer.getAutoSwitchQualityFor('video')) {
        player.dash.mediaPlayer.setAutoSwitchQualityFor('video', true);
        player.dash.mediaPlayer.setAutoSwitchQualityFor('audio', true);
      }

    });

    player.dash.mediaPlayer.on(MediaPlayer.events.QUALITY_CHANGE_REQUESTED, (event) => {
      if (event.mediaType === 'video') {
        player.dash.qualityLevels.selectedIndex = event.newQuality;
        player.dash.qualityLevels.trigger({
          selectedIndex: event.newQuality,
          type: 'change'
        });
      }
    });

  }
};
