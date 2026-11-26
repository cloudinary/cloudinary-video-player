// Size breakdown of one entry chunk by module group. Run: node spikes/s1-size/breakdown.mjs <entry>
import { build } from 'rolldown';
import { gzipSync } from 'node:zlib';
const entry = process.argv[2];
const { output } = await build({ input: entry, platform: 'browser', logLevel: 'silent', output: { format: 'esm', minify: true }, write: false });
const main = output.find((o) => o.type === 'chunk' && o.isEntry);
const groups = {};
for (const [id, m] of Object.entries(main.modules)) {
  const p = id.replace(/.*node_modules\//, '');
  let g = p.split('/').slice(0, 2).join('/');
  if (p.includes('/icons/')) g = 'icons';
  else if (/skin2\.js$|\.css/.test(p)) g = 'skin CSS (inlined)';
  else if (p.includes('/ui/') || p.includes('/define/ui')) g = p.split('/').slice(0, 2).join('/') + ' ui';
  else if (p.includes('i18n')) g = 'i18n';
  groups[g] = (groups[g] || 0) + m.renderedLength;
}
const total = Object.values(groups).reduce((a, b) => a + b, 0);
for (const [g, n] of Object.entries(groups).sort((a, b) => b[1] - a[1])) console.log(String(Math.round(n / 1024)).padStart(5), 'KB raw', (100 * n / total).toFixed(1).padStart(5) + '%', g);
console.log('entry gzip', Math.round(gzipSync(main.code, { level: 9 }).length / 102.4) / 10);
