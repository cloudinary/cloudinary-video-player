import { isFunction } from 'utils/type-inference';
import { PLAYER_EVENT } from 'utils/consts';

export default function imaPlugin(player, playerOptions) {
  import(/* webpackChunkName: "ima" */ './ima').then(() => {
    /* global google */
    const loaded = {
      contribAdsLoaded: isFunction(player.ads),
      imaAdsLoaded: typeof google === 'object' && typeof google.ima === 'object'
    };

    if (!loaded.contribAdsLoaded || !loaded.imaAdsLoaded) {
      if (playerOptions.ads) {
        if (!loaded.contribAdsLoaded) {
          console.log('contribAds is not loaded');
        }
        if (!loaded.imaAdsLoaded) {
          console.log('imaSdk is not loaded');
        }
      }

      return false;
    }

    if (!playerOptions.ads) {
      playerOptions.ads = {};
    }

    const opts = playerOptions.ads;

    if (Object.keys(opts).length === 0) {
      return false;
    }

    player.ima({
      id: player.el().id,
      adTagUrl: opts.adTagUrl,
      disableFlashAds: true,
      prerollTimeout: opts.prerollTimeout || 5000,
      postrollTimeout: opts.postrollTimeout || 5000,
      showCountdown: opts.showCountdown !== false,
      adLabel: opts.adLabel || 'Advertisement',
      locale: opts.locale || 'en',
      autoPlayAdBreaks: opts.autoPlayAdBreaks !== false,
      debug: true
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
  });
}
