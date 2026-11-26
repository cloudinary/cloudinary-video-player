// S-5 browser probe. run.mjs bundles this file with Rolldown and drives it through window.s5.
// It does not import 'dashjs': from here that resolves to the repo's v4 dash.js 4.7.4, not the
// dash.js 5.2.0 that @videojs/dash-video uses. Engine events are named by string instead.
import '@videojs/html/video/player';
import '@videojs/html/media/dash-video';
import '@videojs/html/ui/container';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/audio-track-radio-group';
import '@videojs/html/ui/menu-radio-item';
import { isMediaAudioTrackCapable } from '@videojs/html';

let player;
let media;
const log = [];
const t0 = performance.now();
const stamp = () => Math.round(performance.now() - t0);

function mount({ src, dashJs, width = 640, height = 360 }) {
  document.body.innerHTML = `
    <video-player>
      <media-container style="display:block;width:${width}px;height:${height}px">
        <dash-video muted autoplay playsinline crossorigin="anonymous"></dash-video>
      </media-container>
      <media-quality-radio-group label="Quality"></media-quality-radio-group>
      <media-audio-track-radio-group label="Audio"></media-audio-track-radio-group>
    </video-player>`;
  player = document.querySelector('video-player');
  media = document.querySelector('dash-video');
  media.source = dashJs ? { src, engine: { dashJs } } : { src };
  const { engine } = media;
  engine.on('streamInitialized', () =>
    log.push({ t: stamp(), ev: 'streamInitialized', id: engine.getCurrentRepresentationForType('video')?.id }));
  engine.on('qualityChangeRequested', (e) =>
    log.push({ t: stamp(), ev: 'qualityChangeRequested', type: e.mediaType, from: e.oldRepresentation?.id, id: e.newRepresentation?.id }));
  engine.on('qualityChangeRendered', (e) =>
    log.push({ t: stamp(), ev: 'qualityChangeRendered', type: e.mediaType, from: e.oldRepresentation?.id, id: e.newRepresentation?.id, height: e.newRepresentation?.height }));
  engine.on('trackChangeRendered', (e) =>
    log.push({ t: stamp(), ev: 'trackChangeRendered', type: e.mediaType, lang: e.newMediaInfo?.lang }));
  media.addEventListener('canplay', () => {
    const rep = engine.getCurrentRepresentationForType('video');
    log.push({ t: stamp(), ev: 'canplay', id: rep?.id, height: rep?.height });
  }, { once: true });
}

const rep = (r) => r && { id: r.id, width: r.width, height: r.height, kbps: Math.round(r.bandwidth / 1000), codecs: r.codecs };
const track = (i) => i && { index: i.index, id: i.id, lang: i.lang, roles: (i.roles ?? []).map((r) => r.value ?? r), labels: (i.labels ?? []).map((l) => l.text ?? l) };
const items = (sel) => {
  const group = document.querySelector(sel);
  return { items: group.querySelectorAll('media-menu-radio-item').length, hidden: group.hasAttribute('data-hidden') };
};

function snapshot() {
  const { engine } = media;
  const abr = engine.getSettings().streaming.abr;
  const video = media.target;
  return {
    engineVersion: engine.getVersion(),
    store: {
      videoRenditionList: player.store.videoRenditionList,
      activeVideoRendition: player.store.activeVideoRendition,
      audioTrackList: player.store.audioTrackList,
    },
    qualityMenu: items('media-quality-radio-group'),
    audioMenu: items('media-audio-track-radio-group'),
    elementAudioTracks: media.audioTracks ? [...media.audioTracks].map((a) => ({ id: a.id, lang: a.language, enabled: a.enabled })) : null,
    engine: {
      videoReps: engine.getRepresentationsByType('video').map(rep),
      currentVideoRep: rep(engine.getCurrentRepresentationForType('video')),
      audioTracks: engine.getTracksFor('audio').map(track),
      currentAudioTrack: track(engine.getCurrentTrackFor('audio')),
      abr: {
        autoSwitchBitrate: abr.autoSwitchBitrate,
        maxBitrate: abr.maxBitrate,
        initialBitrate: abr.initialBitrate,
        limitBitrateByPortal: abr.limitBitrateByPortal,
        usePixelRatioInLimitBitrateByPortal: abr.usePixelRatioInLimitBitrateByPortal,
      },
      bufferTimeAtTopQuality: engine.getSettings().streaming.buffer.bufferTimeAtTopQuality,
    },
    videoHeight: video?.videoHeight,
    clientSize: video && [video.clientWidth, video.clientHeight],
    devicePixelRatio: window.devicePixelRatio,
    currentTime: Math.round(media.currentTime * 10) / 10,
    log: [...log],
  };
}

// Own audio bridge: mirrors dash.js audio tracks into the element's audioTracks list, so the store's
// audioTrackList and the built-in audio menu fill. Uses only documented surface: store.target.media,
// isMediaAudioTrackCapable, addAudioTrack/removeAudioTrack and the writable `enabled`, plus the
// dash-video `engine`. It does not write track.id (not documented as writable); the store then keys
// tracks by list position, and the bridge keeps its own map from each track to its dash.js MediaInfo.
function bridgeAudio() {
  const target = player.store.target?.media;
  if (!isMediaAudioTrackCapable(target)) return false;
  const { engine } = target;
  const infoOf = new Map();
  const key = (info) => info && String(info.index);
  const sync = () => {
    for (const t of [...target.audioTracks]) target.removeAudioTrack(t);
    infoOf.clear();
    const current = key(engine.getCurrentTrackFor('audio'));
    for (const info of engine.getTracksFor('audio')) {
      const isCurrent = key(info) === current;
      const t = target.addAudioTrack(isCurrent ? 'main' : 'alternative', info.labels?.[0]?.text ?? '', info.lang ?? '');
      infoOf.set(t, info);
      t.enabled = isCurrent;
    }
  };
  // The list batches 'change' into a microtask, so the loop guard compares state instead of a flag.
  const onChange = () => {
    const info = infoOf.get([...target.audioTracks].find((t) => t.enabled));
    if (info && key(info) !== key(engine.getCurrentTrackFor('audio'))) engine.setCurrentTrack(info);
  };
  const onRendered = (e) => {
    if (e.mediaType !== 'audio') return;
    for (const t of target.audioTracks) t.enabled = key(infoOf.get(t)) === key(e.newMediaInfo);
  };
  engine.on('streamInitialized', sync);
  engine.on('trackChangeRendered', onRendered);
  target.audioTracks.addEventListener('change', onChange);
  if (engine.getTracksFor('audio').length) sync(); // the stream may have started before the bridge
  return true;
}

window.s5 = {
  mount,
  snapshot,
  bridgeAudio,
  selectRendition: (id) => player.store.selectVideoRendition(id),
  selectAudio: (id) => player.store.selectAudioTrack(id),
  // Criterion 2 paths: our own code on the dash.js engine, no store involved.
  enginePinVideo: (id) => {
    media.engine.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
    media.engine.setRepresentationForTypeById('video', id, true);
  },
  engineSetAudio: (lang) => media.engine.setCurrentTrack(media.engine.getTracksFor('audio').find((i) => i.lang === lang)),
  engineUpdateSettings: (settings) => media.engine.updateSettings(settings),
  setDashJs: (dashJs) => { media.source = { ...media.source, engine: { dashJs } }; },
};
