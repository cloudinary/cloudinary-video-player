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

  // withCredentials support: hls.js via xhrSetup, dash.js via tech options
  if (options.withCredentials) {
    config.xhrSetup = function(xhr) {
      xhr.withCredentials = true;
    };
    // No request type sets dash.js's default, covering the manifest and all segments
    player.tech_.options_.dash = { ...player.tech_.options_.dash, setXHRWithCredentialsForType: [undefined, true] };
  }

  player.tech_.options_.hlsjsConfig = config;
  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
