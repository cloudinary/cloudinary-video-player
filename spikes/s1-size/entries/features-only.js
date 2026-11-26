// Floor: the player element with videoFeatures and no skin or controls.
import { createPlayer } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';

const { PlayerElement } = createPlayer({ features: videoFeatures });
customElements.define('cld-spike-player', PlayerElement);
