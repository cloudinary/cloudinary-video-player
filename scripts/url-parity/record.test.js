// Records v4 URLs for every case in cases.js into test/fixtures/url-parity/*.json.
// Run through scripts/record-url-parity.mjs (needs the v4 tree, see there).
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { createVideoPlayer } from '../../src/video-player';
import { fetchAndMergeConfig } from '../../src/utils/fetch-config';
import { sourceCases, playerCases, configCases } from './cases.js';
import '../../src/';

const OUT_DIR = 'test/fixtures/url-parity';
const DEFAULT_CLOUD = { cloud_name: 'demo' };
const DEFAULT_ENV = { width: 640, dpr: 1 };
const settle = () => new Promise((resolve) => setTimeout(resolve, 200));
const recordedFrom = () => ({
  player: `cloudinary-video-player@${process.env.npm_package_version || JSON.parse(execSync('npm pkg get version').toString())}`,
  // The v4 code is master's; HEAD may be a v5 docs or spike commit on top of it
  commit: execSync('git merge-base HEAD origin/master').toString().trim().slice(0, 8)
});

const write = (name, cases) => {
  mkdirSync(OUT_DIR, { recursive: true });
  const fixture = {
    recordedFrom: recordedFrom(),
    environment: 'jsdom; canPlayType() = "maybe"; MediaSource.isTypeSupported() = true; fetch answers 404. '
      + 'Source cases call VideoSource directly with the player\'s secure default; the player adds ?_s=vp on top (see player cases).',
    cases
  };
  writeFileSync(`${OUT_DIR}/${name}.json`, `${JSON.stringify(fixture, null, 2)}\n`);
};

const setDisplay = ({ width, dpr, hdrDisplay }) => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => width });
  window.devicePixelRatio = dpr;
  window.matchMedia = (query) => ({ matches: query === '(dynamic-range: high)' && !!hdrDisplay });
};

// jsdom plays nothing; report every type as playable so v4 keeps its codec-tagged adaptive sources
HTMLMediaElement.prototype.canPlayType = () => 'maybe';
window.MediaSource = { isTypeSupported: () => true };

const recordSource = ({ id, publicId, options = {}, cloudinaryConfig = DEFAULT_CLOUD, sourceTypes, hdrDisplay = false }) => {
  setDisplay({ ...DEFAULT_ENV, hdrDisplay });
  const input = { publicId, options: { cloudinaryConfig, ...options }, sourceTypes, display: { hdr: hdrDisplay } };
  // Like VideoPlayer._initCloudinary(): secure unless the config says secure: false
  const playerCloudinaryConfig = cloudinaryConfig.secure === false ? cloudinaryConfig : { ...cloudinaryConfig, secure: true };
  try {
    const source = new VideoSource(publicId, { cloudinaryConfig: playerCloudinaryConfig, ...options });
    if (sourceTypes) source.sourceTypes(sourceTypes);
    const sources = source.generateSources().map(({ type, src, isAdaptive, withCredentials }) => ({ type, src, isAdaptive, withCredentials }));
    return { id, input, output: { sources, poster: source.poster()?.url() ?? null } };
  } catch (error) {
    return { id, input, output: { error: error.message } };
  }
};

const recordPlayer = async ({ id, player = {}, publicId, source = {}, env = DEFAULT_ENV }, index) => {
  setDisplay(env);
  const requests = [];
  window.fetch = async (url) => {
    requests.push(String(url));
    return new Response('', { status: 404 });
  };
  document.body.innerHTML = `<div><video id="parity-${index}" class="video-js"></video></div>`;
  // The cloudinary.videoPlayer() path: element options + v4 defaults
  const vp = createVideoPlayer(`parity-${index}`, { cloudinaryConfig: DEFAULT_CLOUD, ...player });
  await new Promise((resolve) => vp.videojs.ready(resolve));
  vp.source(publicId, source);
  await settle();
  // jsdom loads no media; chapters and text tracks wait for this event
  vp.videojs.trigger('loadedmetadata');
  await settle();
  const output = {
    sources: (vp.videojs.cloudinary.getCurrentSources() || []).map(({ type, src }) => ({ type, src })),
    poster: vp.videojs.poster() || null,
    textTracks: Array.from(vp.videojs.remoteTextTracks()).map(({ kind, label, language, src }) => ({ kind, label, language, src: src || null })),
    requests: [...new Set(requests)].sort()
  };
  vp.dispose();
  return { id, input: { player, publicId, source, display: env }, output };
};

const recordConfig = async ({ id, options }) => {
  const requests = [];
  window.fetch = async (url) => {
    requests.push(String(url));
    return new Response('', { status: 404 });
  };
  await fetchAndMergeConfig(options);
  return { id, input: { options }, output: { requests } };
};

describe('record v4 URL-parity fixtures', () => {
  it('records source cases', () => {
    write('source', sourceCases.map(recordSource));
  });

  it('records player cases', async () => {
    const cases = [];
    for (const [index, playerCase] of playerCases.entries()) {
      cases.push(await recordPlayer(playerCase, index));
    }
    write('player', cases);
  });

  it('records config cases', async () => {
    const cases = [];
    for (const configCase of configCases) {
      cases.push(await recordConfig(configCase));
    }
    write('config', cases);
  });
});
