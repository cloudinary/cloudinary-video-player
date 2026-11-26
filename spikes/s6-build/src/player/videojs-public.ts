// Fixture: a public Video.js 10 import. It must pass the lint rules.
// Not imported by any entry, so it is not bundled.
import { createPlayer } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';

/** Defines the Video.js player element with the video features. */
export function defineVideoJsPlayer(): void {
  const { PlayerElement } = createPlayer({ features: videoFeatures });
  customElements.define('video-player', PlayerElement);
}
