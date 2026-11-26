// Like v4-controls.js, but the controls that only appear with an optional feature
// (quality and audio menus with adaptive streaming, rate menu with playbackRates,
// chapters, captions) are left out of the first load: they would ship in the
// lazy chunk of their feature.
import { createPlayer } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';
import '@videojs/html/ui/container';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-group';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-group';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/pip-button';
import '@videojs/html/ui/fullscreen-button';

const { PlayerElement } = createPlayer({ features: videoFeatures });
customElements.define('cld-spike-player', PlayerElement);
