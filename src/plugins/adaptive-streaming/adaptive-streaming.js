import 'hls.js';
import 'videojs-contrib-quality-levels';
import 'videojs-contrib-quality-menu';
import './videojs-contrib-hlsjs';
import { qualityLevels } from './quality-levels';
import { hlsjsPresets } from './hlsjs-presets';

export default async function adaptiveStreamingPlugin(player, options) {
  const preset = options.abrProfile;
  player.tech_.options_.hlsjsConfig = hlsjsPresets[preset];
  player.on('loadstart', () => qualityLevels(player, options).init());
  player.qualityMenu();
  player.adaptiveStreamingLoaded = true;
}
