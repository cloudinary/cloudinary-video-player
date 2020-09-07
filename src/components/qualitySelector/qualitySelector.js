import * as djs from 'dashjs';
import 'videojs-per-source-behaviors';
import 'videojs-contrib-quality-levels';
import 'videojs-http-source-selector';

import './quality-selector.scss';

const qualitySelector = {
  init: (player) => {
    // Handle DASH sources, HLS are handled internally.
    if (
      player &&
      player.qualityLevels &&
      player.dash &&
      player.dash.mediaPlayer
    ) {
      const MediaPlayer = djs.default.MediaPlayer;

      player.dash.qualityLevels = player.qualityLevels();

      // When loaded, build quality-level list.
      player.dash.mediaPlayer.on(
        MediaPlayer.events.PLAYBACK_METADATA_LOADED,
        () => {
          let videoRates = player.dash.mediaPlayer.getBitrateInfoListFor(
            'video'
          );
          let audioRates = player.dash.mediaPlayer.getBitrateInfoListFor(
            'audio'
          );

          let normalizeFactor = videoRates[videoRates.length - 1].bitrate;
          player.dash.audioMapper = videoRates.map((rate) =>
            Math.round(
              (rate.bitrate / normalizeFactor) * (audioRates.length - 1)
            )
          );
          videoRates.forEach((vrate) => {
            player.dash.qualityLevels.addQualityLevel({
              id: vrate.bitrate,
              width: vrate.width,
              height: vrate.height,
              bandwidth: vrate.bitrate,
              enabled: function (val) {
                if (val !== undefined) {
                  player.dash.enabled = val;
                } else {
                  return player.dash.enabled !== undefined
                    ? player.dash.enabled
                    : true;
                }
              }
            });
          });
        }
      );

      // Pass qualityLevels 'change' event into the DASH player.
      player.qualityLevels().on('change', (event) => {
        let enabledQualities = player.dash.qualityLevels.levels.filter(
          (q) => q.enabled
        );
        if (enabledQualities.length === 1) {
          if (player.dash.mediaPlayer.getAutoSwitchQualityFor('video')) {
            player.dash.mediaPlayer.setAutoSwitchQualityFor('video', false);
            player.dash.mediaPlayer.setAutoSwitchQualityFor('audio', false);
          }
          player.dash.mediaPlayer.setQualityFor('video', event.selectedIndex);
          player.dash.mediaPlayer.setQualityFor(
            'audio',
            player.dash.audioMapper[event.selectedIndex]
          );
        } else if (!player.dash.mediaPlayer.getAutoSwitchQualityFor('video')) {
          player.dash.mediaPlayer.setAutoSwitchQualityFor('video', true);
          player.dash.mediaPlayer.setAutoSwitchQualityFor('audio', true);
        }
      });

      // Handle 'change' event on the DASH player
      player.dash.mediaPlayer.on(
        MediaPlayer.events.QUALITY_CHANGE_REQUESTED,
        (event) => {
          if (event.mediaType === 'video') {
            player.dash.qualityLevels.selectedIndex = event.newQuality;
            player.dash.qualityLevels.trigger({
              selectedIndex: event.newQuality,
              type: 'change'
            });
          }
        }
      );
    }
  },

  // Show selector only if more then one option available
  setVisibility: (player) => {
    const sourceMenuButton = player.controlBar.getChild('sourceMenuButton');
    if (sourceMenuButton) {
      const qualityLevels = player.qualityLevels();
      if (qualityLevels && qualityLevels.length > 1) {
        sourceMenuButton.show();
      } else {
        sourceMenuButton.hide();
      }

      // ToDo: if there are multiple sources with same height (i.e. 720p)
      // add a bitrate indicator to distinguish them.
      // Labels: 720p => 1280x720 @ 3500Kbps
      // sourceMenuButton.items.forEach((item) => {
      //   const level = qualityLevels.levels_.find(ql => ql.height + 'p' === item.options_.label);
      //   if (level) {
      //     item.el_.innerText = level.width + 'x' + level.height + (level.bitrate ? ' @ ' + (Math.round(level.bitrate / 100)) + 'Kbps' : '');
      //   }
      // });

    }

  }

};

export default qualitySelector;
