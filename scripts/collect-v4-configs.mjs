#!/usr/bin/env node
// Collects v4 configuration samples (SC-004, T003) into test/fixtures/v4-configs/.
//
// - docs/: opens every docs/*.html demo in Chromium with a recording `cloudinary`
//   stub instead of the player bundle, and records each factory call, its options,
//   the target <video> element and the chained calls. Only load-time calls are seen;
//   calls in playlistByTag() and sourcesByTag() promise callbacks are not recorded.
// - built-in/: the four built-in profiles from cloudinary-video-player-profiles.
// - saved/: real saved-profile and per-asset config responses, with URL and date.
// - v4-defaults.json: src/config/defaults.js (needs the v4 tree, see below).
//
// Needs the v4 tree and Playwright's Chromium: run it on `master`, or on a `v5`
// commit before T013 deletes the v4 source.
//
//   npm ci && npx playwright install chromium && node scripts/collect-v4-configs.mjs
import { createServer } from 'node:http';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join } from 'node:path';
import { chromium } from '@playwright/test';
import { runV4Vitest } from './run-v4-vitest.mjs';

const OUT_DIR = 'test/fixtures/v4-configs';
const DOCS_DIR = 'docs';
const SKIP_PAGES = new Set(['index.html', '_template.html']);
const SAVED_SAMPLES = [
  { file: 'prod-demo-profile', url: 'https://res.cloudinary.com/prod/_applet_/video_service/video_player_profiles/demo-profile.json' },
  { file: 'prod-samples-sea-turtle', url: 'https://res.cloudinary.com/prod/_applet_/video_service/video_player_config/video/upload/c2FtcGxlcy9zZWEtdHVydGxl.json' }
];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const today = new Date().toISOString().slice(0, 10);

const writeJson = async (path, data) => {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
};

// Runs in the page before any demo script: a `cloudinary` global that records calls
const recorderInitScript = () => {
  const serialize = (value, seen = new WeakSet()) => {
    if (typeof value === 'function') return '[Function]';
    if (value instanceof Element) return `[Element ${value.tagName.toLowerCase()}${value.id ? `#${value.id}` : ''}]`;
    if (value && typeof value === 'object') {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      if (Array.isArray(value)) return value.map((item) => serialize(item, seen));
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item, seen)]));
    }
    return value === undefined ? null : value;
  };
  const describeElement = (el) => el && {
    tag: el.tagName.toLowerCase(),
    attributes: Object.fromEntries(Array.from(el.attributes).map(({ name, value }) => [name, value])),
    sources: Array.from(el.querySelectorAll('source, track')).map((child) => ({
      tag: child.tagName.toLowerCase(),
      attributes: Object.fromEntries(Array.from(child.attributes).map(({ name, value }) => [name, value]))
    }))
  };
  const resolveTargets = (target, many) => {
    if (target instanceof Element) return [target];
    if (typeof target !== 'string') return [];
    return many ? Array.from(document.querySelectorAll(target)) : [document.getElementById(target)].filter(Boolean);
  };

  window.__v4Players = [];
  const ASYNC_METHODS = ['playlistByTag', 'sourcesByTag'];
  // Any property is a method that records its call and returns the same chainable proxy
  const chainable = (calls, path = []) => new Proxy(() => {}, {
    get: (_, prop) => {
      if (prop === Symbol.toPrimitive) return () => '';
      if (prop === 'then' || typeof prop === 'symbol') return undefined;
      return chainable(calls, [...path, prop]);
    },
    apply: (_, __, args) => {
      const call = path.join('.');
      calls.push({ call, args: serialize(args) });
      // Code in a promise callback is page UI, not configuration: it gets a proxy that records nothing
      return ASYNC_METHODS.includes(call) ? Promise.resolve(chainable([])) : chainable(calls, path.slice(0, -1));
    }
  });
  const factory = (name, { many = false, async = false } = {}) => (target, options, ready) => {
    const calls = [];
    window.__v4Players.push({
      factory: name,
      target: serialize(target),
      options: serialize(options ?? null),
      readyCallback: typeof ready === 'function',
      elements: resolveTargets(target, many).map(describeElement),
      calls
    });
    const player = chainable(calls);
    const result = many ? [player] : player;
    return async ? Promise.resolve(result) : result;
  };
  window.cloudinary = {
    videoPlayer: factory('videoPlayer'),
    videoPlayers: factory('videoPlayers', { many: true }),
    player: factory('player', { async: true }),
    players: factory('players', { many: true, async: true }),
    Cloudinary: { new: (instanceConfig) => ({
      videoPlayer: factory('Cloudinary.new().videoPlayer'),
      videoPlayers: factory('Cloudinary.new().videoPlayers', { many: true }),
      instanceConfig
    }) }
  };
  // Globals that blocked scripts would define: the player bundle's videojs, highlight.js and ua-parser-js
  window.videojs = new Proxy({}, { get: (_, prop) => (prop === 'getComponent' ? () => class {} : prop === 'default' ? undefined : () => {}) });
  window.hljs = { initHighlightingOnLoad: () => {}, highlightBlock: () => {} };
  window.UAParser = function UAParser() {
    return { getBrowser: () => ({}), getOS: () => ({}), getResult: () => ({}) };
  };
};

const serveDocs = () => new Promise((resolve) => {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    try {
      const body = await readFile(join(DOCS_DIR, path));
      res.writeHead(200, { 'content-type': MIME[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(0, '127.0.0.1', () => resolve(server));
});

const collectDocs = async () => {
  const server = await serveDocs();
  const origin = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const pages = (await readdir(DOCS_DIR)).filter((name) => name.endsWith('.html') && !SKIP_PAGES.has(name)).sort();
  try {
    for (const name of pages) {
      const context = await browser.newContext();
      // Only the demo page and its helper scripts load; the player bundle and every other origin are blocked
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url());
        const isLocal = url.origin === origin;
        const isPlayerBundle = /^\/player.*\.(js|css)$/.test(url.pathname);
        return isLocal && !isPlayerBundle ? route.continue() : route.abort();
      });
      await context.addInitScript(recorderInitScript);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`${origin}/${name}`, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const players = await page.evaluate(() => window.__v4Players);
      const iframes = await page.evaluate(() => Array.from(document.querySelectorAll('iframe'))
        .map((iframe) => iframe.src).filter((src) => src.includes('player.cloudinary.com')));
      await writeJson(join(OUT_DIR, 'docs', name.replace(/\.html$/, '.json')), {
        page: `docs/${name}`,
        players,
        ...(iframes.length ? { iframes } : {}),
        ...(errors.length ? { pageErrors: errors } : {})
      });
      console.log(`${name}: ${players.length} player(s)${iframes.length ? `, ${iframes.length} iframe(s)` : ''}${errors.length ? `, ${errors.length} page error(s)` : ''}`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
};

const collectBuiltInProfiles = async () => {
  const require = createRequire(import.meta.url);
  const { version } = require('cloudinary-video-player-profiles/package.json');
  const { defaultProfiles } = require('cloudinary-video-player-profiles');
  for (const profile of defaultProfiles) {
    await writeJson(join(OUT_DIR, 'built-in', `${profile.name}.json`), {
      source: `cloudinary-video-player-profiles@${version}`,
      ...profile
    });
  }
};

const collectSaved = async () => {
  for (const { file, url } of SAVED_SAMPLES) {
    const response = await fetch(url);
    await writeJson(join(OUT_DIR, 'saved', `${file}.json`), {
      source: url,
      fetchedOn: today,
      status: response.status,
      response: await response.json()
    });
  }
};

await collectBuiltInProfiles();
await collectSaved();
// src/config/defaults.js imports Video.js, so it is read through the v4 Vitest setup
runV4Vitest(new URL('./v4-configs/vitest.config.mjs', import.meta.url));
await collectDocs();
