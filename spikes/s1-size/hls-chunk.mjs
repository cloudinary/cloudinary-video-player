// S-1 follow-up for T011: the cost of the hls.js adapter chunk (design B: the
// quality and audio menus ship in it). Builds in memory, writes nothing to dist/.
// Run from the repository root: node spikes/s1-size/hls-chunk.mjs
import { build } from 'rolldown';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const version = JSON.parse(readFileSync(new URL(import.meta.resolve('@videojs/html/package.json')), 'utf8')).version;
const hlsVersion = JSON.parse(readFileSync(new URL(import.meta.resolve('hls.js/package.json')), 'utf8')).version;
const kb = (n) => Math.round((n / 1024) * 10) / 10;
const base = readFileSync(join(here, 'entries', 'v4-controls-lazy-menus.js'), 'utf8');
const chunk = [
  "import '@videojs/html/media/hlsjs-video';",
  "import '@videojs/html/ui/menu';",
  "import '@videojs/html/ui/menu-content';",
  "import '@videojs/html/ui/menu-radio-item';",
  "import '@videojs/html/ui/quality-radio-group';",
  "import '@videojs/html/ui/audio-track-radio-group';"
].join('\n');

const gzipOf = async (code) => {
  const { output } = await build({
    input: 'virtual-entry',
    platform: 'browser',
    logLevel: 'silent',
    plugins: [{ name: 'virtual', resolveId: (id) => (id === 'virtual-entry' ? id : null), load: (id) => (id === 'virtual-entry' ? code : null) }],
    output: { format: 'esm', minify: true, codeSplitting: false },
    write: false,
    cwd: here
  });
  return gzipSync(output.map((o) => o.code ?? '').join('\n'), { level: 9 }).length;
};

const parts = {
  'hls.js (full build)': "import Hls from 'hls.js'; window.Hls = Hls;",
  'hls.js (light build)': "import Hls from 'hls.js/dist/hls.light.mjs'; window.Hls = Hls;",
  '<hlsjs-video> define': "import '@videojs/html/media/hlsjs-video';"
};
for (const [label, code] of Object.entries(parts)) console.log(label, kb(await gzipOf(code)), 'KB gzip');
const withoutHls = await gzipOf(base);
const withHls = await gzipOf(`${base}\n${chunk}`);
const alone = await gzipOf(chunk);
console.log(JSON.stringify({
  videojs: version,
  hlsjs: hlsVersion,
  marginalChunkGzipKB: kb(withHls - withoutHls),
  standaloneGzipKB: kb(alone)
}, null, 2));
