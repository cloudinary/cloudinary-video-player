import 'hls.js';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-menu';
import './videojs-contrib-hlsjs';
import { qualityLevels } from './quality-levels';
import { abrStrategies, hdrSupported } from './abr-strategies';

export default async function adaptiveStreamingPlugin(player, options) {
  const config = {
    ...abrStrategies[options.strategy],
    videoPreference: hdrSupported ? { preferHDR: true } : undefined
  };
  console.log('>>>>>>>>>>>>>>>> config: ', config);
  player.tech_.options_.hlsjsConfig = config;
  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
