/* global google */
import isFunction from 'lodash/isFunction';
import { PLAYER_EVENT } from '~/utils/consts';

export default async function imaPlugin(player, playerOptions) {
  // videojs-contrib-ads requires initialization before the first loadstart, but the
  // ima module is loaded async — record a loadstart that fires while the chunk is
  // still loading so it can be replayed after initialization.
  let missedLoadStart = false;
  const recordLoadStart = () => {
    missedLoadStart = true;
  };
  player.one(PLAYER_EVENT.LOAD_START, recordLoadStart);

  await import(/* webpackChunkName: "ima" */ './ima');

  const loaded = {
    contribAdsLoaded: isFunction(player.ads),
    imaAdsLoaded: typeof google === 'object' && typeof google.ima === 'object'
  };

  if (playerOptions.ads && (!loaded.contribAdsLoaded || !loaded.imaAdsLoaded)) {
    if (!loaded.contribAdsLoaded) {
      console.warn('contribAds is not loaded');
    }
    if (!loaded.imaAdsLoaded) {
      console.warn('imaSdk is not loaded');
    }
    player.off(PLAYER_EVENT.LOAD_START, recordLoadStart);
    return false;
  }

  player.ima({
    id: player.el().id,
    adTagUrl: playerOptions.ads.adTagUrl,
    disableFlashAds: true,
    prerollTimeout: playerOptions.ads.prerollTimeout || 5000,
    postrollTimeout: playerOptions.ads.postrollTimeout || 5000,
    showCountdown: playerOptions.ads.showCountdown !== false,
    adLabel: playerOptions.ads.adLabel || 'Advertisement',
    locale: playerOptions.ads.locale || 'en',
    autoPlayAdBreaks: playerOptions.ads.autoPlayAdBreaks !== false,
    debug: playerOptions.ads.debug
  });

  player.off(PLAYER_EVENT.LOAD_START, recordLoadStart);
  if (missedLoadStart) {
    // Replay the loadstart that contrib-ads missed, otherwise its ad state machine
    // waits for one indefinitely and prerolls never play.
    player.trigger(PLAYER_EVENT.LOAD_START);
  }

  if (Object.keys(playerOptions.ads).length > 0 && typeof player.ima === 'object') {
    if (playerOptions.ads.adsInPlaylist === 'first-video') {
      player.one(PLAYER_EVENT.SOURCE_CHANGED, () => {
        player.ima.playAdBreak();
      });
    } else {
      player.on(PLAYER_EVENT.SOURCE_CHANGED, () => {
        player.ima.playAdBreak();
      });
    }
  }

}
