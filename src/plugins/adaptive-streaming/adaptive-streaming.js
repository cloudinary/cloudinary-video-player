import 'hls.js';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-menu';
import './videojs-contrib-hlsjs';
import { qualityLevels } from './quality-levels';

export default async function adaptiveStreamingPlugin(player, options) {
  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
