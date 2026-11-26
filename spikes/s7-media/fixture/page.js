// S-7 fixture: the mechanism under test. Bundled by ../run.mjs (Rolldown) and loaded by index.html.
// Exposes `window.spike` for the Playwright checks. Throwaway code, not a v5 module.
import '@videojs/html/video/player';
import '@videojs/html/video/skin';
import '@videojs/html/media/hlsjs-video';
import '@videojs/html/ui/container';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import { UIElement, PlayerController, playerContext, selectTime, selectPlayback } from '@videojs/html';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

// 1. Adopt the integrator's <video>: wrap it in <video-player><video-skin> at its place in the page.
function mount(id) {
  const video = document.getElementById(id);
  const player = document.createElement('video-player');
  const skin = document.createElement('video-skin');
  const layer = document.createElement('cld-overlay-layer');
  video.replaceWith(player);
  skin.append(video, layer);
  player.append(skin);
  return { player, skin, video, layer };
}

// 2. Engine switch. The engine element is replaced; the integrator's <video> node is moved, never cloned.
async function toHls(ctx, source) {
  const { video } = ctx;
  const hls = document.createElement('hlsjs-video');
  video.replaceWith(hls); // the wrapper takes the video's place in the skin
  video.slot = 'media';
  hls.append(video); // light-DOM <video slot="media"> becomes the wrapper's target
  await settle(); // slotchange: the adapter leaves its shadow fallback <video> and attaches to ours
  hls.source = source;
  return hls;
}

async function toNative(ctx, src, { waitForDetach = true } = {}) {
  const { video } = ctx;
  const hls = video.parentElement;
  hls.replaceWith(video); // moves our <video> back into the skin; the wrapper disconnects
  video.removeAttribute('slot');
  if (waitForDetach) await settle(); // wrapper destroy (microtask) runs hls.js detachMedia on our <video> first
  video.src = src;
}

// 3. Overlay layer: one light-DOM child of <video-skin>, slotted into <media-container>, driven by the store.
class OverlayLayer extends UIElement {
  #time = new PlayerController(this, playerContext, selectTime);
  #playback = new PlayerController(this, playerContext, selectPlayback);
  #overlays = new Set();

  addOverlay({ id, content, trigger = 'manual', placement = 'full', dismissible = true }) {
    const el = document.createElement('div');
    el.className = `cld-overlay cld-overlay--${placement}`;
    if (id) el.id = id;
    el.hidden = true;
    el.setAttribute('role', placement === 'full' ? 'dialog' : 'status');
    const title = document.createElement('p');
    title.textContent = content.title ?? ''; // strings as text, never HTML
    el.append(title);
    for (const action of content.actions ?? []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      button.addEventListener('click', action.onClick);
      el.append(button);
    }
    const overlay = {
      el,
      trigger,
      dismissed: false,
      get visible() { return !el.hidden; },
      show: () => { el.hidden = false; },
      hide: () => { el.hidden = true; },
      remove: () => { el.remove(); this.#overlays.delete(overlay); },
    };
    if (dismissible) el.addEventListener('keydown', (e) => e.key === 'Escape' && overlay.hide());
    this.#overlays.add(overlay);
    this.append(el);
    this.requestUpdate();
    return overlay;
  }

  update(changed) {
    super.update(changed);
    const time = this.#time.value;
    const playback = this.#playback.value;
    if (!time || !playback) return;
    for (const overlay of this.#overlays) {
      const { trigger } = overlay;
      if (trigger === 'ended') overlay.el.hidden = !playback.ended;
      else if (trigger?.beforeEnd != null) {
        const remaining = time.duration - time.currentTime;
        overlay.el.hidden = playback.ended || !(time.duration > 0 && remaining <= trigger.beforeEnd);
      }
    }
  }
}
customElements.define('cld-overlay-layer', OverlayLayer);

// 4. Touch fixture: own <media-container> with a time slider whose change-throttle is set in markup.
function mountTouch(src, throttle) {
  const root = document.getElementById('touch-root');
  root.innerHTML = `
    <video-player>
      <media-container class="touch-container">
        <video muted playsinline preload="auto" crossorigin="anonymous"></video>
        <media-time-slider class="touch-slider"${throttle ? ` change-throttle="${throttle}"` : ''}>
          <media-slider-track><media-slider-fill></media-slider-fill></media-slider-track>
          <media-slider-thumb></media-slider-thumb>
        </media-time-slider>
      </media-container>
    </video-player>`;
  const video = root.querySelector('video');
  video.src = src;
  return { player: root.querySelector('video-player'), video, slider: root.querySelector('media-time-slider') };
}

// Every <video> in the document, through open shadow roots.
function allVideos(root = document) {
  const found = [...root.querySelectorAll('video')];
  for (const el of root.querySelectorAll('*')) if (el.shadowRoot) found.push(...allVideos(el.shadowRoot));
  return found;
}

window.spike = { mount, toHls, toNative, mountTouch, allVideos, settle };
