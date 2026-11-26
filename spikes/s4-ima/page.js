// S-4 test page, bundled by run.mjs with Rolldown. A Video.js 10 player plays a
// Google IMA pre-roll, then the content. Everything is logged to window.spike:
// IMA ad events, content <video> events, and snapshots of the player store.
//
// URL parameters:
//   layout = before | after | shadow  where the IMA ad container sits (see README)
//   ios    = true                     setDisableCustomPlaybackForIOS10Plus(true)
//   tag    = <ad tag URL>
import { createPlayer } from '@videojs/html';
import { videoFeatures } from '@videojs/html/video';
import '@videojs/html/ui/container';

const params = new URLSearchParams(location.search);
const layout = params.get('layout') ?? 'shadow';
const CONTENT_SRC = 'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4';
const W = 640;
const H = 360;

const t0 = performance.now();
const log = [];
const add = (kind, name, extra = {}) => log.push({ t: Math.round(performance.now() - t0), kind, name, ...extra });
const round = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : n);
const short = (url) => (url ? url.replace(/^https?:\/\/([^/]+)\/.*\/([^/?]*).*$/, '$1/…/$2').slice(0, 70) : '');

// The candidate mechanism: an own element whose shadow root holds the IMA ad
// container. The player's media discovery (querySelector('video, audio') on its
// light DOM) cannot see into it.
class AdLayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML =
      '<style>:host{position:absolute;inset:0;z-index:2;display:block}:host([hidden]){display:none}div{width:100%;height:100%}</style><div></div>';
  }

  get container() {
    return this.shadowRoot.querySelector('div');
  }
}
customElements.define('cld-ad-layer', AdLayer);

function makeContent(role) {
  const video = document.createElement('video');
  Object.assign(video, { src: CONTENT_SRC, muted: true, playsInline: true, preload: 'auto' });
  video.dataset.role = role;
  video.style.cssText = 'width:100%;height:100%;display:block';
  for (const type of ['loadstart', 'emptied', 'durationchange', 'play', 'playing', 'pause', 'ended']) {
    video.addEventListener(type, () => add('content', type, { role, time: round(video.currentTime), src: short(video.currentSrc) }));
  }
  return video;
}

const style = document.createElement('style');
style.textContent = '.ad-layer{position:absolute;inset:0;z-index:2}.ad-layer[hidden]{display:none}#play{position:absolute;z-index:3;left:16px;bottom:16px}';
document.head.append(style);

const player = document.createElement('cld-player');
const box = document.createElement('media-container');
box.style.cssText = `position:relative;display:block;width:${W}px;height:${H}px;background:#000`;
let content = makeContent('content');
const layer = layout === 'shadow' ? document.createElement('cld-ad-layer') : Object.assign(document.createElement('div'), { className: 'ad-layer' });
layer.hidden = true;
const playButton = Object.assign(document.createElement('button'), { id: 'play', type: 'button', textContent: 'Play' });
// "before" and "shadow" put the ad layer before the content in document order;
// "after" puts it after the content.
if (layout === 'after') box.append(content, layer, playButton);
else box.append(layer, content, playButton);
player.append(box);
document.body.append(player);
const adContainer = layout === 'shadow' ? layer.container : layer;

const { PlayerElement } = createPlayer({ features: videoFeatures });
customElements.define('cld-player', PlayerElement);
const store = player.store;

const which = (el) => {
  if (!el) return 'null';
  if (adContainer.contains(el)) return 'ima';
  return el.dataset?.role ?? el.localName;
};

function snap(label) {
  const imaVideos = adContainer.querySelectorAll('video');
  add('snap', label, {
    media: which(store.target?.media),
    discovery: which(player.querySelector('video, audio')),
    storePaused: store.paused,
    storeTime: round(store.currentTime),
    storeDuration: round(store.duration),
    storeSrc: short(store.currentSrc),
    contentPaused: content.paused,
    contentTime: round(content.currentTime),
    contentSrc: short(content.currentSrc),
    imaVideos: imaVideos.length,
    imaVideoSrc: short(imaVideos[0]?.currentSrc),
  });
}

// Log every change of the store's media target and of store.paused.
let lastMedia;
let lastPaused;
setInterval(() => {
  const media = which(store.target?.media);
  if (media !== lastMedia) add('store', `media=${media}`), (lastMedia = media);
}, 50);
store.subscribe(() => {
  if (store.paused !== lastPaused) add('store', `paused=${store.paused}`), (lastPaused = store.paused);
});

const state = { phase: 'loading', done: false, layout, ios: params.get('ios') ?? 'default' };
const tryStore = (action) => {
  try {
    const result = store[action]();
    result?.catch?.((error) => add('store', `${action}-rejected`, { message: String(error) }));
  } catch (error) {
    add('store', `${action}-threw`, { message: String(error) });
  }
};

function finish(reason) {
  if (state.phase === 'content' || state.done) return;
  state.phase = 'content';
  layer.hidden = true;
  add('ads', 'resume-content', { reason });
  tryStore('play');
  setTimeout(() => snap('content+1s'), 1000);
  setTimeout(() => {
    snap('content+3s');
    state.done = true;
  }, 3000);
}

await new Promise((resolve, reject) => {
  const script = Object.assign(document.createElement('script'), { src: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js', onload: resolve });
  script.onerror = () => reject(new Error('IMA SDK did not load'));
  document.head.append(script);
});
const ima = google.ima;
add('ima', 'sdk-loaded', { version: ima.VERSION });
snap('before-AdDisplayContainer');
if (params.get('ios') === 'true') ima.settings.setDisableCustomPlaybackForIOS10Plus(true);

const adDisplayContainer = new ima.AdDisplayContainer(adContainer, content);
snap('after-AdDisplayContainer');
const adsLoader = new ima.AdsLoader(adDisplayContainer);
let adsManager = null;
let playRequested = false;
let duringAd = null;

const startAds = () => {
  try {
    adsManager.init(W, H, ima.ViewMode.NORMAL);
    adsManager.setVolume(0);
    adsManager.start();
  } catch (error) {
    add('ads', 'start-threw', { message: String(error) });
    finish('start-threw');
  }
};

const SNAP_ON = new Set(['contentPauseRequested', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'skip', 'contentResumeRequested', 'allAdsCompleted']);
let progressEvents = 0;
function onAdEvent(event) {
  if (event.type === ima.AdEvent.Type.AD_PROGRESS) return void progressEvents++;
  const ad = event.getAd?.();
  const extra = event.type === ima.AdEvent.Type.STARTED
    ? { adDuration: ad?.getDuration(), linear: ad?.isLinear(), customPlaybackUsed: adsManager.isCustomPlaybackUsed() }
    : {};
  add('ima', event.type, extra);
  if (event.type === ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED) {
    state.phase = 'ad';
    layer.hidden = false;
    tryStore('pause');
    duringAd = setInterval(() => snap('during-ad'), 1000);
  }
  if (event.type === ima.AdEvent.Type.CONTENT_RESUME_REQUESTED) clearInterval(duringAd);
  if (SNAP_ON.has(event.type)) snap(`ima:${event.type}`);
  if (event.type === ima.AdEvent.Type.CONTENT_RESUME_REQUESTED) finish('CONTENT_RESUME_REQUESTED');
}

function onAdError(event) {
  const error = event.getError();
  add('ima', 'AD_ERROR', { code: error.getErrorCode(), message: error.getMessage() });
  clearInterval(duringAd);
  finish('AD_ERROR');
}

adsLoader.addEventListener(ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (event) => {
  const settings = new ima.AdsRenderingSettings();
  settings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  adsManager = event.getAdsManager(content, settings);
  add('ima', 'ADS_MANAGER_LOADED', { cuePoints: adsManager.getCuePoints() });
  for (const type of Object.values(ima.AdEvent.Type)) adsManager.addEventListener(type, onAdEvent);
  adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  state.phase = 'ready';
  if (playRequested) startAds();
});
adsLoader.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, (event) => {
  state.phase = 'ready';
  onAdError(event);
});
// With iOS custom playback the ad plays in the content element and fires `ended` too;
// that one is not the end of the content.
content.addEventListener('ended', () => {
  if (state.phase === 'ad') return void add('content', 'ended-during-ad-ignored');
  adsLoader.contentComplete();
});

const request = new ima.AdsRequest();
request.adTagUrl = params.get('tag');
request.linearAdSlotWidth = W;
request.linearAdSlotHeight = H;
request.nonLinearAdSlotWidth = W;
request.nonLinearAdSlotHeight = H / 3;
request.setAdWillAutoPlay(true);
request.setAdWillPlayMuted(true);
adsLoader.requestAds(request);

// initialize() must run inside the user gesture (iOS needs it; IMA warns otherwise).
playButton.addEventListener('click', () => {
  add('ui', 'click');
  playButton.hidden = true;
  adDisplayContainer.initialize();
  snap('after-initialize');
  playRequested = true;
  if (adsManager) startAds();
});

// Replace the content <video> the way an engine switch or a playlist item could:
// remove it, wait (an async chunk load), insert a new one.
async function gapTest() {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  snap('gap:before');
  const next = content.nextSibling;
  content.remove();
  await sleep(300);
  snap('gap:content-removed');
  content = makeContent('content-2');
  box.insertBefore(content, next);
  await sleep(300);
  snap('gap:content-2-inserted');
}

window.spike = { log, state, snap, gapTest, progressEvents: () => progressEvents };
