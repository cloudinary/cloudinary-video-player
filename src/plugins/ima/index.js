/* global google */
import { isFunction } from 'utils/type-inference';
import { PLAYER_EVENT } from 'utils/consts';

export default async function imaPlugin(player, playerOptions) {
  await import(/* webpackChunkName: "ima" */ './ima');

  const loaded = {
    contribAdsLoaded: isFunction(player.ads),
    imaAdsLoaded: typeof google === 'object' && typeof google.ima === 'object'
  };

  if (playerOptions.ads && (!loaded.contribAdsLoaded || !loaded.imaAdsLoaded)) {
    if (!loaded.contribAdsLoaded) {
      console.log('contribAds is not loaded');
    }
    if (!loaded.imaAdsLoaded) {
      console.log('imaSdk is not loaded');
    }
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
    debug: playerOptions.ads.denug
  });

  if (Object.keys(playerOptions.ads).length > 0 && typeof player.ima === 'object') {
    if (playerOptions.ads.adsInPlaylist === 'first-video') {
      player.one(PLAYER_EVENT.SOURCE_CHANGED, () => {
        player.ima.playAd();
      });
    } else {
      player.on(PLAYER_EVENT.SOURCE_CHANGED, () => {
        player.ima.playAd();
      });
    }
  }

}
