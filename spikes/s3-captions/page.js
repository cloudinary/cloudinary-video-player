// S-3 browser module: a Video.js 10 player plus our own caption renderer.
// The renderer keeps the selected caption track in `hidden` mode (cues and `cuechange`
// work, the browser draws nothing), draws the active cues in an overlay inside
// <media-container> (the fullscreen target) and applies the v4 style options.
// In iPhone native fullscreen our overlay is not visible, so the track goes `showing`
// there and the browser draws it. Bundled by run.mjs; not production code.
import { createPlayer } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';

const { PlayerElement } = createPlayer({ features: videoFeatures });
customElements.define('cld-spike-player', PlayerElement);
// Define the player BEFORE <media-container>: a container upgraded first never registers with
// its player, and requestFullscreen() then falls back to the <video> (overlay not in fullscreen).
await Promise.all([
  import('@videojs/html/ui/container'),
  import('@videojs/html/ui/captions-button'),
  import('@videojs/html/ui/fullscreen-button'),
  import('@videojs/html/ui/hotkey'),
  document.querySelector('hlsjs-video') && import('@videojs/html/media/hlsjs-video'),
]);

const isCaptionTrack = (track) => track.kind === 'captions' || track.kind === 'subtitles';
const captionTracks = (media) => Array.from(media.textTracks).filter(isCaptionTrack);
// CSSOM writes, not a <style> element: no CSP 'unsafe-inline' needed (v4 injects a <style>).
const setStyle = (el, style = {}) => Object.entries(style).forEach(([key, value]) => el.style.setProperty(key, value));

/**
 * @param options v4 `textTracks.options`: theme, fontFace, fontSize, gravity, box, style, wordHighlightStyle
 * @param pacedTracks tracks built from a transcript with word highlight (their `<b>` is the current word)
 * @param claimShowing render a track that something else (browser `default`, hls.js, a built-in control) set to `showing`
 * @param video where the webkit*fullscreen events fire: the native <video>, or <hlsjs-video> (its event bridge forwards them)
 */
export function createCaptions({ media, video = media, container, options = {}, pacedTracks = new WeakSet(), claimShowing = true, onRender }) {
  const { theme = 'default', gravity = 'bottom', fontFace, fontSize, box, style, wordHighlightStyle } = options;
  const overlay = document.createElement('div');
  overlay.className = ['cld-cc', `cld-cc-theme-${theme}`, ...gravity.split('-').map((g) => `cld-cc-gravity-${g}`)].join(' ');
  overlay.setAttribute('aria-live', 'off');
  overlay.translate = true;
  if (fontFace) overlay.style.setProperty('font-family', fontFace);
  if (box) setStyle(overlay, { translate: `${box.x ?? 0} ${box.y ?? 0}`, ...(box.width && { width: box.width }), ...(box.height && { height: box.height }) });
  container.append(overlay);

  const listeners = new AbortController();
  let cueListener = null;
  let active = null;
  let nativeFullscreen = false;

  const render = () => {
    overlay.replaceChildren();
    const cues = active?.mode === 'hidden' ? Array.from(active.activeCues ?? []) : [];
    for (const cue of cues) {
      const el = document.createElement('div');
      el.className = 'cld-cc-cue';
      if (fontSize) el.style.setProperty('font-size', fontSize);
      setStyle(el, style);
      el.append(cue.getCueAsHTML()); // browser-parsed WebVTT markup (b, i, u, c, v, ruby): no innerHTML
      if (pacedTracks.has(active)) {
        el.querySelectorAll('b').forEach((word) => {
          word.classList.add('cld-cc-word');
          setStyle(word, wordHighlightStyle);
        });
      }
      overlay.append(el);
    }
    onRender?.(cues);
  };

  // What our own captions menu calls: one track `hidden` (ours), the other caption tracks `disabled`.
  const select = (track) => {
    cueListener?.abort();
    active = track;
    captionTracks(media).forEach((t) => {
      const mode = t === track ? 'hidden' : 'disabled';
      if (t.mode !== mode) t.mode = mode;
    });
    if (track) {
      cueListener = new AbortController();
      track.addEventListener('cuechange', render, { signal: cueListener.signal });
    }
    render();
  };

  const { signal } = listeners;
  media.textTracks.addEventListener('change', () => {
    const showing = captionTracks(media).find((t) => t.mode === 'showing');
    if (claimShowing && showing && !nativeFullscreen) select(showing);
    else render();
  }, { signal });

  // iPhone native fullscreen (no element fullscreen): hand the track to the native renderer.
  video.addEventListener('webkitbeginfullscreen', () => {
    nativeFullscreen = true;
    if (active) active.mode = 'showing';
    render();
  }, { signal });
  // Back inline: adopt whatever the user picked in the native captions menu (or off).
  video.addEventListener('webkitendfullscreen', () => {
    nativeFullscreen = false;
    select(captionTracks(media).find((t) => t.mode === 'showing') ?? null);
  }, { signal });

  const initial = captionTracks(media).find((t) => t.mode === 'showing');
  if (claimShowing && initial) select(initial);

  return {
    overlay,
    select,
    get active() {
      return active;
    },
    destroy() {
      listeners.abort();
      cueListener?.abort();
      overlay.remove();
    },
  };
}

window.spike = { createCaptions, captionTracks };
window.dispatchEvent(new Event('spike-ready'));
