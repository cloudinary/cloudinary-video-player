import 'hls.js';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-menu';
import './videojs-contrib-hlsjs';
import { qualityLevels } from './quality-levels';
import { abrStrategies } from './abr-strategies';

export default async function adaptiveStreamingPlugin(player, options) {
  const strategy = options.strategy;
  player.tech_.options_.hlsjsConfig = abrStrategies[strategy];
  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
