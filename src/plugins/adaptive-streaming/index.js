import 'hls.js';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-menu';
import './videojs-contrib-hlsjs';
import { qualityLevels } from './quality-levels';

export default async function adaptiveStreamingPlugin(player, options) {
  if (options.isDash) {
    await import(/* webpackChunkName: "dash" */ 'videojs-contrib-dash');
  }

  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
