import '../styles/video/compat.css';
import './skin.css';
import '@videojs/html/i18n';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/title';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-backdrop';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/tooltip-group';
import '@videojs/html/ui/controls-group';
import '@videojs/html/ui/airplay-button';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/cast-button';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/seek-button';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/time-slider-chapters';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/time-slider-chapter-title';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-popover';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/time-group';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-separator';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-item';
import '@videojs/html/ui/menu-separator';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/audio-track-radio-group';
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/captions-radio-group';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/status-announcer';
import '@videojs/html/ui/volume-indicator';
import '@videojs/html/ui/volume-indicator-fill';
import '@videojs/html/ui/volume-indicator-value';
import '@videojs/html/ui/status-indicator';
import '@videojs/html/ui/status-indicator-value';
import '@videojs/html/ui/seek-indicator';
import '@videojs/html/ui/seek-indicator-value';
import { registerIcons } from '@videojs/html/icons';
import {
  airPlayEnterIcon as airPlayEnterIconCompat,
  airPlayExitIcon as airPlayExitIconCompat,
  captionsOffIcon as captionsOffIconCompat,
  captionsOnIcon as captionsOnIconCompat,
  castEnterIcon as castEnterIconCompat,
  castExitIcon as castExitIconCompat,
  checkIcon as checkIconCompat,
  chevronIcon as chevronIconCompat,
  fullscreenEnterIcon as fullscreenEnterIconCompat,
  fullscreenExitIcon as fullscreenExitIconCompat,
  gearIcon as gearIconCompat,
  pauseIcon as pauseIconCompat,
  pipEnterIcon as pipEnterIconCompat,
  pipExitIcon as pipExitIconCompat,
  playIcon as playIconCompat,
  restartIcon as restartIconCompat,
  seekIcon as seekIconCompat,
  speechIcon as speechIconCompat,
  speedIcon as speedIconCompat,
  spinnerIcon as spinnerIconCompat,
  switchesIcon as switchesIconCompat,
  volumeHighIcon as volumeHighIconCompat,
  volumeLowIcon as volumeLowIconCompat,
  volumeOffIcon as volumeOffIconCompat,
} from '@videojs/html/icons/compat';

registerIcons('compat', {
  'airplay-enter': airPlayEnterIconCompat,
  'airplay-exit': airPlayExitIconCompat,
  'captions-off': captionsOffIconCompat,
  'captions-on': captionsOnIconCompat,
  'cast-enter': castEnterIconCompat,
  'cast-exit': castExitIconCompat,
  check: checkIconCompat,
  chevron: chevronIconCompat,
  'fullscreen-enter': fullscreenEnterIconCompat,
  'fullscreen-exit': fullscreenExitIconCompat,
  gear: gearIconCompat,
  pause: pauseIconCompat,
  'pip-enter': pipEnterIconCompat,
  'pip-exit': pipExitIconCompat,
  play: playIconCompat,
  restart: restartIconCompat,
  seek: seekIconCompat,
  speech: speechIconCompat,
  speed: speedIconCompat,
  spinner: spinnerIconCompat,
  switches: switchesIconCompat,
  'volume-high': volumeHighIconCompat,
  'volume-low': volumeLowIconCompat,
  'volume-off': volumeOffIconCompat,
});
