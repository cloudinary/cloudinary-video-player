import videojs from 'video.js';
import 'hls.js';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-menu';
import './videojs-contrib-hlsjs';
import { qualityLevels } from './quality-levels';
import { abrStrategies, hdrSupported } from './abr-strategies';

export default async function adaptiveStreamingPlugin(player, options) {
  const config = {
    ...abrStrategies[options.strategy],
    // iOS reports HEVC renditions as not smooth despite HW decoding, so hls.js pins the lowest level.
    // Rely on measured frame drops instead. Other platforms keep the hls.js defaults.
    ...(videojs.browser.IS_IOS && { useMediaCapabilities: false, capLevelOnFPSDrop: true }),
    videoPreference: hdrSupported ? { preferHDR: true } : undefined
  };

  // Add xhrSetup configuration for withCredentials support
  if (options.withCredentials) {
    config.xhrSetup = function(xhr) {
      xhr.withCredentials = true;
    };
  }

  player.tech_.options_.hlsjsConfig = config;
  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
