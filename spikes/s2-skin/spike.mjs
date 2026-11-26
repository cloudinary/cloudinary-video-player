// S-2 skin spike: eject the Video.js 10 Default and Compat video skins from the Shadcn registry,
// flatten @scope, audit the CSS against the v5 floor, and run both skins in Playwright.
// Run from the repository root:
//   node spikes/s2-skin/spike.mjs                 # flatten + audit + browser (fetch only when ejected/ is missing)
//   node spikes/s2-skin/spike.mjs fetch           # re-fetch the registry source (read-only GETs)
//   node spikes/s2-skin/spike.mjs flatten audit   # any subset of: fetch flatten audit browser
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { browserslistToTargets, Features, transform } from 'lightningcss';
import browserslist from 'browserslist';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const buildDir = join(here, 'build');
const REGISTRY = { default: 'https://shadcn.videojs.org/r/html', compat: 'https://shadcn.videojs.org/r/html/compat' };
const SKINS = Object.keys(REGISTRY);
const FLOOR = { chrome: 111, firefox: 121, safari: 16.4 };
const MP4 = 'https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4';
const kb = (n) => Math.round((n / 1024) * 10) / 10;
const gz = (s) => kb(gzipSync(s, { level: 9 }).length);
const results = existsSync(join(here, 'results.json')) ? JSON.parse(readFileSync(join(here, 'results.json'), 'utf8')) : {};

// ---------------------------------------------------------------------------------------------- fetch
async function fetchSkins() {
  const manifest = { fetched: new Date().toISOString().slice(0, 10), skins: {} };
  for (const [skin, base] of Object.entries(REGISTRY)) {
    const out = join(here, 'ejected', skin);
    rmSync(out, { recursive: true, force: true });
    const queue = ['video'];
    const items = [];
    while (queue.length) {
      const name = queue.shift();
      if (items.some((i) => i.name === name)) continue;
      const res = await fetch(`${base}/${name}.json`);
      if (!res.ok) throw new Error(`${base}/${name}.json: HTTP ${res.status}`);
      const item = await res.json();
      items.push({ name, title: item.title, dependencies: item.dependencies ?? [], files: item.files.map((f) => f.target) });
      for (const f of item.files) {
        const file = join(out, f.target.replace(/^@components\//, ''));
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, f.content);
      }
      queue.push(...(item.registryDependencies ?? []).map((d) => d.replace(/^@videojs\//, '')));
    }
    manifest.skins[skin] = { registry: `${base}/{name}.json`, items };
  }
  writeFileSync(join(here, 'ejected', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('fetched', Object.entries(manifest.skins).map(([s, m]) => `${s}: ${m.items.map((i) => i.name).join(', ')}`).join(' | '));
}

// -------------------------------------------------------------------------------------------- flatten
const skinDir = (skin) => join(here, 'ejected', skin, 'videojs', 'video');

/** The skin's CSS as one sheet: the CSS files skin.ts imports, in import order, with @import inlined. */
function rawCss(skin) {
  const ts = readFileSync(join(skinDir(skin), 'skin.ts'), 'utf8');
  const seen = new Set();
  const inline = (file) => {
    if (seen.has(file)) return '';
    seen.add(file);
    return readFileSync(file, 'utf8').replace(/^@import\s+"([^"]+)";\s*$/gm, (_, p) => inline(join(dirname(file), p)));
  };
  return [...ts.matchAll(/^import '(\.[^']+\.css)';$/gm)].map((m) => inline(join(skinDir(skin), m[1]))).join('\n');
}

/** The flatten plugin from docs/guides/browser-support.md ("Flatten @scope in registry skins"), plus a keyframes guard. */
function flattenScope() {
  const rewrite = (selector, root) =>
    selectorParser((selectors) => {
      selectors.each((sel) => {
        let referencesRoot = false;
        sel.walk((node) => {
          if (node.type === 'nesting' || (node.type === 'pseudo' && node.value === ':scope')) {
            node.replaceWith(selectorParser.string({ value: `:where(${root})` }));
            referencesRoot = true;
          }
        });
        if (!referencesRoot) {
          sel.prepend(selectorParser.combinator({ value: ' ' }));
          sel.prepend(selectorParser.string({ value: `:where(${root})` }));
        }
      });
    }).processSync(selector);

  return {
    postcssPlugin: 'flatten-scope',
    OnceExit(css) {
      const scopes = [];
      css.walkAtRules('scope', (atRule) => scopes.push(atRule));
      // Innermost first, so a nested scope is flattened before its parent prefixes it.
      for (const atRule of scopes.reverse()) {
        const match = /^\(\s*(.+?)\s*\)\s*$/.exec(atRule.params);
        if (!match || /\)\s*to\s*\(/.test(atRule.params)) continue; // left in place: the checks fail on it
        atRule.walkRules((rule) => {
          if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
          rule.selectors = rule.selectors.map((selector) => rewrite(selector.trim(), match[1]));
        });
        atRule.replaceWith(atRule.nodes);
      }
    },
  };
}
flattenScope.postcss = true;

const isKeyframe = (rule) => rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name);
function stats(root) {
  // scopePseudoOutside: `:scope` in rules outside any @scope (it then means :root; the skins keep two such
  // shadow-DOM `::slotted` rules, inert in light DOM). The flatten must leave exactly those.
  const s = { scopeBlocks: 0, scopeTo: 0, styleRules: 0, nestedRules: 0, nestingSelectors: 0, scopePseudo: 0, scopePseudoOutside: 0, badKeyframes: 0 };
  const inScope = (node) => {
    for (let p = node.parent; p; p = p.parent) if (p.type === 'atrule' && p.name === 'scope') return true;
    return false;
  };
  root.walkAtRules('scope', (a) => {
    s.scopeBlocks += 1;
    if (/\)\s*to\s*\(/.test(a.params)) s.scopeTo += 1;
  });
  root.walkRules((rule) => {
    if (isKeyframe(rule)) {
      if (!/^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(rule.selector.trim())) s.badKeyframes += 1;
      return;
    }
    s.styleRules += 1;
    if (rule.parent.type === 'rule') s.nestedRules += 1;
    selectorParser((sels) => sels.walk((n) => {
      if (n.type === 'nesting') s.nestingSelectors += 1;
      if (n.type === 'pseudo' && n.value === ':scope') s[inScope(rule) ? 'scopePseudo' : 'scopePseudoOutside'] += 1;
    })).processSync(rule.selector);
  });
  return s;
}

function flatten() {
  mkdirSync(buildDir, { recursive: true });
  results.flatten = {};
  for (const skin of SKINS) {
    const raw = rawCss(skin);
    const flat = postcss([flattenScope()]).process(raw, { from: undefined }).css;
    const before = stats(postcss.parse(raw));
    const after = stats(postcss.parse(flat));
    // Lightning CSS parses every selector strictly; a broken rewrite would throw here.
    const min = (code) => transform({ filename: `${skin}.css`, code: Buffer.from(code), minify: true, errorRecovery: false });
    const minRaw = min(raw);
    const minFlat = min(flat);
    const checks = {
      'no @scope left': after.scopeBlocks === 0,
      'no @scope … to (…) in source': before.scopeTo === 0,
      'no rule nested in a rule (true CSS nesting) in source': before.nestedRules === 0,
      'no & and no scoped :scope left': after.nestingSelectors === 0 && after.scopePseudoOutside === before.scopePseudoOutside,
      'keyframe selectors untouched': after.badKeyframes === 0,
      'same number of style rules': before.styleRules === after.styleRules,
      'Lightning CSS parses the output without warnings': minFlat.warnings.length === 0,
    };
    writeFileSync(join(buildDir, `${skin}.raw.css`), raw);
    writeFileSync(join(buildDir, `${skin}.flat.css`), flat);
    const textMin = (r) => new TextDecoder().decode(r.code);
    results.flatten[skin] = {
      before, after, checks,
      size: {
        raw: { bytes: kb(raw.length), minGzip: gz(textMin(minRaw)) },
        flat: { bytes: kb(flat.length), minGzip: gz(textMin(minFlat)) },
      },
    };
    console.log(`flatten ${skin}:`, JSON.stringify({ before, after }), Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => `FAILED: ${k}`).join('; ') || 'all checks pass');
    if (Object.values(checks).some((ok) => !ok)) process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------------------------- audit
const caniuse = require('caniuse-lite');
const lcssVersion = JSON.parse(readFileSync(join(here, '../../node_modules/lightningcss/package.json'), 'utf8')).version;
const vnum = (v) => parseFloat(String(v).split('-')[0]);
/** First version with full, unprefixed support in caniuse-lite (and the first prefixed one, if earlier). */
// partial: count partial support ("a") too, for features the skins use only in the supported part.
function ci(id, partial = false) {
  const data = caniuse.feature(require(`caniuse-lite/data/features/${id}.js`));
  const first = (browser) => {
    const rows = Object.entries(data.stats[browser]).sort((a, b) => vnum(a[0]) - vnum(b[0]));
    const full = rows.find(([, s]) => (partial ? /^[ya]\b/ : /^y\b/).test(s) && !/\bx\b/.test(s));
    return full ? vnum(full[0]) : Infinity;
  };
  return { chrome: first('chrome'), firefox: first('firefox'), safari: first('safari'), source: `caniuse-lite ${require('caniuse-lite/package.json').version}: ${id}${partial ? ' (first partial support)' : ''}` };
}
const DOCS = 'node_modules/@videojs/html/docs/guides';
const doc = (chrome, firefox, safari, where) => ({ chrome, firefox, safari, source: `${DOCS}/${where}` });
const unknown = (why) => ({ chrome: null, firefox: null, safari: null, source: `no local data (${why})` });

/** Lightning CSS's own compat data: the first version for which it stops lowering a probe. */
function lcssFirst(probe) {
  const run = (targets) => new TextDecoder().decode(transform({ filename: 'p.css', code: Buffer.from(probe), minify: true, targets }).code);
  const unchanged = run(undefined);
  const v = (n) => { const [a, b = 0] = String(n).split('.').map(Number); return (a << 16) | (b << 8); };
  const scan = (browser, list) => list.find((ver) => run({ [browser]: v(ver) }) === unchanged) ?? Infinity;
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return {
    chrome: scan('chrome', range(90, 150)),
    firefox: scan('firefox', range(80, 150)),
    safari: Number(scan('safari', ['15', '15.4', '16', '16.1', '16.2', '16.3', '16.4', '16.5', '17', '17.1', '17.2', '17.3', '17.4', '17.5', '18', '26'])),
    source: `lightningcss ${lcssVersion} compat data (probe: ${probe})`,
  };
}

// kind: 'at' (whole block dropped if unsupported), 'sel' (whole rule dropped unless in :is()/:where()),
// 'decl' (one declaration dropped), 'value' (declaration dropped; in a custom property it fails where used).
const FEATURES = [
  { id: '@scope', kind: 'at', at: (a) => a.name === 'scope', support: () => ci('css-cascade-scope') },
  { id: 'CSS nesting (&)', kind: 'sel', sel: (n) => n.type === 'nesting', support: () => ci('css-nesting') },
  { id: ':has()', kind: 'sel', sel: (n) => n.type === 'pseudo' && n.value === ':has', support: () => ci('css-has') },
  { id: ':dir()', kind: 'sel', sel: (n) => n.type === 'pseudo' && n.value === ':dir', support: () => ci('css-dir-pseudo') },
  { id: ':popover-open (Popover API)', kind: 'sel', sel: (n) => n.type === 'pseudo' && n.value === ':popover-open', support: () => doc(114, 125, 17, 'browser-support.md') },
  { id: '@container', kind: 'at', at: (a) => a.name === 'container', support: () => ci('css-container-queries') },
  // The skins query only custom properties, which is the partial support caniuse lists.
  { id: 'container style queries (custom properties)', kind: 'at', at: (a) => a.name === 'container' && /\bstyle\(/.test(a.params), support: () => ci('css-container-queries-style', true) },
  { id: 'media query range syntax', kind: 'at', at: (a) => a.name === 'media' && /[<>]/.test(a.params), support: () => ci('css-media-range-syntax') },
  { id: '@layer', kind: 'at', at: (a) => a.name === 'layer', support: () => ci('css-cascade-layers') },
  { id: '@property', kind: 'at', at: (a) => a.name === 'property', support: () => unknown('not in caniuse-lite 1.0.30001760 or the bundled docs') },
  { id: 'color-mix()', kind: 'value', value: /color-mix\(/, support: () => doc(111, 113, 16.2, 'browser-support.md') },
  { id: 'oklch()', kind: 'value', value: /oklch\((?!\s*from\b)/, support: () => ci('css-lch-lab') },
  { id: 'relative color (from …)', kind: 'value', value: /\(\s*from\s/, support: () => ci('css-relative-colors') },
  { id: 'light-dark()', kind: 'value', value: /light-dark\(/, support: () => lcssFirst('.a{color:light-dark(red,blue)}') },
  { id: 'linear() easing', kind: 'value', value: /\blinear\(/, support: () => unknown('not in caniuse-lite 1.0.30001760 or Lightning CSS 1.33 compat data') },
  { id: 'contrast-color()', kind: 'value', value: /contrast-color\(/, support: () => doc(147, 146, 26, 'customize-skins.md') },
  { id: 'anchor positioning', kind: 'decl', prop: /^(anchor-name|position-anchor|position-area|position-try.*|anchor-scope)$/, value: /\banchor(-size)?\(/, support: () => ci('css-anchor-positioning') },
  { id: 'container query units', kind: 'value', value: /\d(cqw|cqh|cqi|cqb|cqmin|cqmax)\b/, support: () => ci('css-container-query-units') },
  { id: 'dvh / svh / lvh', kind: 'value', value: /\d(dvh|svh|lvh|dvw|svw|lvw)\b/, support: () => ci('viewport-unit-variants') },
  { id: 'backdrop-filter (unprefixed)', kind: 'decl', prop: /^backdrop-filter$/, support: () => ci('css-backdrop-filter') },
  { id: '-webkit-backdrop-filter (Safari < 18 needs it)', kind: 'decl', prop: /^-webkit-backdrop-filter$/, support: () => ({ chrome: 0, firefox: 0, safari: 0, source: 'prefix: reference count only' }) },
  { id: 'scrollbar-color / scrollbar-width', kind: 'decl', prop: /^scrollbar-(color|width)$/, support: () => ci('css-scrollbar') },
  { id: 'corner-shape', kind: 'decl', prop: /^corner-shape$/, support: () => unknown('not in caniuse-lite; a progressive declaration') },
  { id: 'interpolate-size', kind: 'decl', prop: /^interpolate-size$/, support: () => unknown('not in caniuse-lite; a progressive declaration') },
];

function scanFeatures(css) {
  const root = postcss.parse(css);
  const out = Object.fromEntries(FEATURES.map((f) => [f.id, { uses: 0, bare: 0, inSupports: 0, fallbackDecl: 0, customProp: 0, forgiving: 0, samples: [] }]));
  const supportsOf = (node) => {
    for (let p = node.parent; p; p = p.parent) if (p.type === 'atrule' && p.name === 'supports') return p.params;
    return null;
  };
  const hit = (f, node, how, sample) => {
    const o = out[f.id];
    o.uses += 1;
    const guard = supportsOf(node);
    if (guard) o.inSupports += 1;
    else if (how) o[how] += 1;
    else o.bare += 1;
    if (!guard && how !== 'forgiving' && how !== 'fallbackDecl' && o.samples.length < 4) o.samples.push(sample.replace(/\s+/g, ' ').slice(0, 140));
  };
  root.walkAtRules((a) => FEATURES.filter((f) => f.at?.(a)).forEach((f) => hit(f, a, null, `@${a.name} ${a.params}`)));
  root.walkRules((rule) => {
    if (isKeyframe(rule)) return;
    for (const f of FEATURES.filter((x) => x.sel)) {
      for (const sel of rule.selectors) {
        let found = false;
        let forgiving = false;
        selectorParser((s) => s.walk((n) => {
          if (!found && f.sel(n)) {
            found = true;
            for (let p = n.parent; p; p = p.parent) if (p.type === 'pseudo' && [':is', ':where'].includes(p.value)) forgiving = true;
          }
        })).processSync(sel);
        if (found) hit(f, rule, forgiving ? 'forgiving' : null, sel);
      }
    }
  });
  root.walkDecls((d) => {
    for (const f of FEATURES.filter((x) => x.prop || x.value)) {
      if (!(f.prop?.test(d.prop) || f.value?.test(d.value))) continue;
      const custom = d.prop.startsWith('--');
      const fallback = !custom && d.parent.nodes.slice(0, d.parent.nodes.indexOf(d)).some((n) => n.type === 'decl' && n.prop === d.prop);
      hit(f, d, custom ? 'customProp' : fallback ? 'fallbackDecl' : null, `${d.parent.selector ?? `@${d.parent.name}`} { ${d.prop}: ${d.value} }`);
    }
  });
  return out;
}

function verdict(f, support, use) {
  if (!use || use.uses === 0) return 'not used';
  const above = support.chrome == null ? null : Object.entries(FLOOR).filter(([b, min]) => support[b] > min).map(([b]) => b);
  const exposed = use.bare + use.customProp; // uses that a floor browser without the feature would act on
  if (above && above.length === 0) return 'ok at floor';
  if (exposed === 0) return `guarded (${above ? `above floor in ${above.join(', ')}` : 'version unknown'}; all uses in @supports, :is()/:where() or after a fallback)`;
  const effect = { at: 'the at-rule is ignored', sel: 'the rule is dropped', decl: 'the declaration is dropped', value: 'the declaration is dropped' }[f.kind];
  const parts = [use.bare && `${use.bare} bare (${effect})`, use.customProp && `${use.customProp} in a custom property (invalid at computed-value time where used)`].filter(Boolean);
  return `${above ? `ABOVE FLOOR in ${above.join(', ')}` : 'version not verified here'}: ${parts.join('; ')}`;
}

function audit() {
  const packaged = (name) => readFileSync(join(here, '../../node_modules/@videojs/html/dist/default/define/video', name), 'utf8');
  const sheets = {
    'default (registry, raw)': readFileSync(join(buildDir, 'default.raw.css'), 'utf8'),
    'default (flattened)': readFileSync(join(buildDir, 'default.flat.css'), 'utf8'),
    'default (packaged dist skin.css)': packaged('skin.css'),
    'compat (registry, raw)': readFileSync(join(buildDir, 'compat.raw.css'), 'utf8'),
    'compat (flattened)': readFileSync(join(buildDir, 'compat.flat.css'), 'utf8'),
    'compat (packaged dist compat-skin.css)': packaged('compat-skin.css'),
  };
  const scans = Object.fromEntries(Object.entries(sheets).map(([k, css]) => [k, scanFeatures(css)]));
  const rows = FEATURES.map((f) => {
    const support = f.support();
    const row = { feature: f.id, kind: f.kind, support, uses: {}, verdict: {} };
    for (const k of Object.keys(sheets)) {
      const u = scans[k][f.id];
      row.uses[k] = u.uses ? `${u.uses} (bare ${u.bare}, @supports ${u.inSupports}, fallback ${u.fallbackDecl}, custom-prop ${u.customProp}, :is/:where ${u.forgiving})` : 0;
      if (/flattened/.test(k)) row.verdict[k.split(' ')[0]] = verdict(f, support, u);
      if (/flattened/.test(k) && u.samples.length && !/^ok|^not used/.test(row.verdict[k.split(' ')[0]])) row[`samples ${k.split(' ')[0]}`] = u.samples;
    }
    return row;
  });
  // Reference: the packaged CSS is the upstream build of the same source (flattened, lowered, build-checked).
  // Compare declarations (selector + at-rule context + property -> value) and vendor prefixes. Lightning CSS
  // at the floor targets (excluding LightDark and DirSelector, as the docs advise) shows what a build adds.
  const targets = browserslistToTargets(browserslist('chrome 111, firefox 121, safari 16.4, ios_saf 16.4'));
  const lcss = (css, opts) => new TextDecoder().decode(transform({ filename: 'x.css', code: Buffer.from(css), ...opts }).code);
  const ctx = (n) => { const a = []; for (let p = n.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule') a.unshift(`@${p.name} ${p.params}`); return a.join(' > '); };
  const decls = (css) => { const m = new Map(); postcss.parse(lcss(css, { minify: true })).walkDecls((d) => { if (d.parent.type === 'rule') m.set(`${ctx(d.parent)} | ${d.parent.selector} | ${d.prop}`, d.value); }); return m; };
  const prefixes = (css) => { const c = {}; postcss.parse(css).walkDecls((d) => { if (/^-(webkit|moz)-/.test(d.prop)) c[d.prop] = (c[d.prop] ?? 0) + 1; }); return c; };
  const reference = {};
  for (const skin of SKINS) {
    const flatCss = sheets[`${skin} (flattened)`];
    const pack = sheets[Object.keys(sheets).find((k) => k.startsWith(`${skin} (packaged`))];
    const a = decls(flatCss);
    const b = decls(pack);
    const onlyFlat = [...a.keys()].filter((k) => !b.has(k));
    const onlyPackaged = [...b.keys()].filter((k) => !a.has(k));
    const lowered = lcss(flatCss, { targets, exclude: Features.LightDark | Features.DirSelector });
    reference[skin] = {
      declarations: { flat: a.size, packaged: b.size, same: [...a.keys()].filter((k) => b.has(k) && a.get(k) === b.get(k)).length, sameKeyOtherValue: [...a.keys()].filter((k) => b.has(k) && a.get(k) !== b.get(k)).length, onlyFlat: onlyFlat.length, onlyPackaged: onlyPackaged.length, onlyPackagedNotShadowDom: onlyPackaged.filter((k) => !/:host|::slotted|^ \| (video-player|media-container )/.test(k)).length },
      onlyFlatSample: onlyFlat.slice(0, 2),
      onlyPackagedSample: onlyPackaged.slice(0, 2),
      prefixes: { flat: prefixes(flatCss), packaged: prefixes(pack), 'flat + Lightning CSS (floor targets)': prefixes(lowered) },
    };
    console.log(`reference ${skin}:`, JSON.stringify(reference[skin].declarations), JSON.stringify(reference[skin].prefixes));
  }
  results.audit = { floor: FLOOR, rows, reference };
  for (const r of rows) console.log(`${r.feature.padEnd(46)} ${JSON.stringify({ c: r.support.chrome, f: r.support.firefox, s: r.support.safari })}  default: ${r.verdict.default}  |  compat: ${r.verdict.compat}`);
}

// -------------------------------------------------------------------------------------------- browser
// One own control in the control bar (before the captions button) and one overlay (a child of
// media-container, right after the media). Both skins get the same insertions.
const OWN_CONTROL = '<cld-logo-button class="media-button"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 18H6a4 4 0 0 1-.6-7.95A6 6 0 0 1 17 8.5a4.5 4.5 0 0 1 2 9.5z"/></svg></cld-logo-button>';
const OVERLAY = '<div class="cld-overlay">Overlay</div>';

function page(skin) {
  let html = readFileSync(join(skinDir(skin), 'skin.html'), 'utf8');
  const swap = (from, to) => {
    if (html.split(from).length !== 2) throw new Error(`${skin}/skin.html: expected exactly one "${from}"`);
    html = html.replace(from, to);
  };
  swap('<!-- Add a compatible media component here. -->', `<video src="${MP4}" playsinline preload="auto"></video>\n${OVERLAY}`);
  swap('<media-container ', '<media-container style="display: block; width: 800px; aspect-ratio: 16 / 9;" ');
  swap('<media-captions-button ', `${OWN_CONTROL}\n<media-captions-button `);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>S-2 ${skin}</title>
<link id="skin-css" rel="stylesheet" href="${skin}.flat.css"><link rel="stylesheet" href="own-ui.css">
<style>body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }</style></head>
<body><video-player>${html}</video-player><script type="module" src="${skin}/bundle.js"></script></body></html>`;
}

async function bundle(skin) {
  const { build } = await import('rolldown');
  const entry = join(buildDir, `${skin}.entry.js`);
  const rel = (p) => `./${relative(buildDir, p)}`;
  writeFileSync(entry, ["import '@videojs/html/video/player';", `import '${rel(join(skinDir(skin), 'skin.ts'))}';`, `import '${rel(join(here, 'fixtures', 'own-ui.js'))}';`, ''].join('\n'));
  // skin.ts imports its CSS; the page links the (flattened) sheet instead, so CSS imports load as empty modules.
  const cssStub = { name: 'css-stub', load: (id) => (id.endsWith('.css') ? { code: '', moduleType: 'js' } : null) };
  const { output } = await build({ input: entry, platform: 'browser', logLevel: 'warn', plugins: [cssStub], output: { dir: join(buildDir, skin), entryFileNames: 'bundle.js', format: 'esm', minify: true }, write: true });
  const chunks = output.filter((o) => o.type === 'chunk');
  const main = chunks.find((c) => c.isEntry);
  const first = [main, ...chunks.filter((c) => main.imports.includes(c.fileName))].map((c) => c.code).join('\n');
  return { firstLoadGzip: gz(first), lazyChunks: chunks.length - 1 - main.imports.length };
}

function serve(root) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  const server = createServer((req, res) => {
    const file = join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Media events (they do not bubble, so capture on document), own-control activations and fullscreen changes.
function recordEvents() {
  window.__ev = [];
  for (const t of ['loadedmetadata', 'play', 'playing', 'pause', 'seeked', 'error']) {
    document.addEventListener(t, (e) => e.target instanceof HTMLMediaElement && window.__ev.push({ t, time: e.target.currentTime }), true);
  }
  for (const t of ['cld-logo-activate', 'fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(t, () => window.__ev.push({ t }), true);
}

const evCount = (p) => p.evaluate(() => window.__ev.length);
const waitEvent = (p, t, from, timeout = 15000) => p.waitForFunction(([type, i]) => window.__ev.slice(i).some((e) => e.t === type), [t, from], { timeout }).then(() => true, () => false);
const media = (p) => p.evaluate(() => { const v = document.querySelector('video'); return { paused: v.paused, currentTime: Math.round(v.currentTime * 100) / 100, duration: Math.round(v.duration * 100) / 100 }; });
const logo = (p) => p.evaluate(() => { const el = document.querySelector('cld-logo-button'); return { dataPaused: el.hasAttribute('data-paused'), updates: el.updates }; });
// Controls hide before start and after inactivity; pointer activity over the player shows them.
async function wake(p) {
  const b = await p.locator('media-container').boundingBox();
  await p.mouse.move(b.x + b.width * 0.85, b.y + b.height * 0.35);
  await p.mouse.move(b.x + b.width * 0.85 + 5, b.y + b.height * 0.35 + 5);
  await p.waitForTimeout(400);
}

async function runSkin(browser, engine, skin, origin) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 700 } });
  const p = await context.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.addInitScript(recordEvents);
  await p.goto(`${origin}/${skin}.html`);
  const r = { engine, skin };
  r.metadata = await p.waitForFunction(() => document.querySelector('video')?.readyState >= 1, null, { timeout: 20000 }).then(() => true, () => false);
  await p.waitForTimeout(500);

  // 1. Renders: the elements are upgraded and the flattened CSS applies.
  r.render = await p.evaluate((expectedRules) => {
    const c = document.querySelector('media-container');
    const box = c.getBoundingClientRect();
    const btn = getComputedStyle(c.querySelector('media-play-button'));
    let rules = 0;
    const walk = (list) => { for (const rule of list) { if (rule instanceof CSSStyleRule) rules += 1; if (rule.cssRules && !(rule instanceof CSSKeyframesRule)) walk(rule.cssRules); } };
    walk(document.getElementById('skin-css').sheet.cssRules);
    return {
      size: [Math.round(box.width), Math.round(box.height)],
      notUpgraded: [...new Set([...c.querySelectorAll('*')].filter((e) => e.localName.includes('-') && !customElements.get(e.localName)).map((e) => e.localName))],
      playButtonStyle: { display: btn.display, cursor: btn.cursor, width: btn.width },
      controlsZIndex: getComputedStyle(c.querySelector('media-controls-content')).zIndex,
      styleRulesParsed: rules,
      styleRulesInSheet: expectedRules,
    };
  }, results.flatten[skin].after.styleRules);
  r.logoBeforeStart = await logo(p);

  // 2. Play with the center button, pause with the control-bar button.
  let from = await evCount(p);
  await wake(p);
  await p.locator('.video-controls-center media-play-button').click();
  r.play = { playingEvent: await waitEvent(p, 'playing', from) };
  await p.waitForTimeout(1500);
  Object.assign(r.play, await media(p));
  r.logoWhilePlaying = await logo(p);

  from = await evCount(p);
  await wake(p);
  await p.locator('media-controls-group:not(.video-controls-center) > media-play-button').click();
  r.pause = { pauseEvent: await waitEvent(p, 'pause', from), ...(await media(p)) };
  r.logoWhilePaused = await logo(p);

  // 3. Time slider: pointer click at 50 %, then one ArrowRight on the focused slider.
  from = await evCount(p);
  await wake(p);
  const s = await p.locator('media-time-slider').boundingBox();
  await p.mouse.click(s.x + s.width / 2, s.y + s.height / 2);
  r.seekPointer = { seekedEvent: await waitEvent(p, 'seeked', from), ...(await media(p)), ariaValueText: await p.locator('media-time-slider').getAttribute('aria-valuetext') };
  r.seekPointer.nearHalf = Math.abs(r.seekPointer.currentTime - r.seekPointer.duration / 2) < r.seekPointer.duration * 0.1;
  from = await evCount(p);
  await p.locator('media-time-slider').focus();
  await p.keyboard.press('ArrowRight');
  r.seekKey = { seekedEvent: await waitEvent(p, 'seeked', from), ...(await media(p)) };
  r.seekKey.moved = r.seekKey.currentTime > r.seekPointer.currentTime;

  // 4. Own control: in the control bar, styled like its neighbours, reactive, keyboard operable.
  await wake(p);
  r.ownControl = await p.evaluate(() => {
    const el = document.querySelector('cld-logo-button');
    const group = el.closest('media-controls-group');
    const box = el.getBoundingClientRect();
    // Nearest visible button in the same group (the captions button is hidden when the media has no tracks).
    const visible = [...group.querySelectorAll('.media-button')].filter((b) => b !== el && b.getBoundingClientRect().width > 0);
    const near = visible.sort((a, b) => Math.abs(a.getBoundingClientRect().x - box.x) - Math.abs(b.getBoundingClientRect().x - box.x))[0];
    const sib = near.getBoundingClientRect();
    return { group: group.className, size: [Math.round(box.width), Math.round(box.height)], neighbour: near.localName, neighbourSize: [Math.round(sib.width), Math.round(sib.height)], sameRow: Math.abs(box.top - sib.top) < 2, role: el.getAttribute('role'), label: el.getAttribute('aria-label'), tabIndex: el.tabIndex };
  });
  from = await evCount(p);
  await p.locator('cld-logo-button').click();
  await p.locator('cld-logo-button').focus();
  await p.keyboard.press('Enter');
  await p.keyboard.press(' ');
  await p.waitForTimeout(300);
  r.ownControl.activations = await p.evaluate((i) => window.__ev.slice(i).filter((e) => e.t === 'cld-logo-activate').length, from);
  r.ownControl.stillPausedAfterSpace = (await media(p)).paused;
  r.ownControl.reactsToState = r.logoBeforeStart.dataPaused && !r.logoWhilePlaying.dataPaused && r.logoWhilePaused.dataPaused;

  // 5. Overlay: above the media, below the controls, inside the fullscreen element.
  await wake(p);
  await p.locator('media-container').screenshot({ path: join(buildDir, 'shots', `${engine}-${skin}.png`) });
  r.overlay = await p.evaluate(() => {
    const o = document.querySelector('.cld-overlay');
    const c = document.querySelector('media-container');
    const mid = (el) => { const b = el.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    const name = (el) => (el?.closest('.cld-overlay') ? 'overlay' : el?.closest('media-play-button') ? 'media-play-button' : el?.localName ?? null);
    const res = { zIndex: getComputedStyle(o).zIndex, parent: o.parentElement === c ? 'media-container' : o.parentElement.localName, hitAtOverlayCenter: name(document.elementFromPoint(...mid(o))) };
    // Stretch the overlay over the whole player for one hit test against a control.
    const style = o.getAttribute('style');
    o.style.cssText = 'top: 0; left: 0; width: 100%; height: 100%;';
    res.coverAllHitAtBarPlayButton = name(document.elementFromPoint(...mid(c.querySelector('media-controls-group:not(.video-controls-center) > media-play-button'))));
    if (style === null) o.removeAttribute('style'); else o.setAttribute('style', style);
    return res;
  });
  from = await evCount(p);
  await wake(p);
  await p.locator('media-fullscreen-button').click();
  const entered = await p.waitForFunction(() => !!(document.fullscreenElement || document.webkitFullscreenElement), null, { timeout: 5000 }).then(() => true, () => false);
  await p.waitForTimeout(600);
  r.fullscreen = { entered, ...(entered ? await p.evaluate(() => {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    const o = document.querySelector('.cld-overlay');
    const b = o.getBoundingClientRect();
    return { element: `${fs.localName}.${[...fs.classList].join('.')}`, containsOverlay: fs.contains(o), containsOwnControl: fs.contains(document.querySelector('cld-logo-button')), overlayBox: [b.x, b.y, b.width, b.height].map(Math.round), viewport: [innerWidth, innerHeight], hitAtOverlayCenter: document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.closest('.cld-overlay') ? 'overlay' : 'other' };
  }) : {}) };
  if (entered) await p.evaluate(() => (document.exitFullscreen ?? document.webkitExitFullscreen).call(document)).catch(() => {});
  r.errors = errors;
  await context.close();
  return r;
}

// Raw (@scope) vs flattened: the same DOM, one sheet at a time, every computed property of every element
// (and its ::before / ::after) inside the player. "baseline" repeats the flattened snapshot to show noise.
async function styleDiff(browser, skin, origin) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 700 } });
  const p = await context.newPage();
  await p.goto(`${origin}/${skin}.html`);
  // Wait for the whole clip to buffer, so the buffer bar stops changing between snapshots.
  await p.waitForFunction(() => { const v = document.querySelector('video'); return v?.buffered.length && v.buffered.end(v.buffered.length - 1) >= v.duration - 0.25; }, null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1000);
  const out = await p.evaluate(async ([raw, flat]) => {
    const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const sheet = (text) => { const s = new CSSStyleSheet(); s.replaceSync(text); return s; };
    const els = (() => { const c = document.querySelector('media-container'); return [c, ...c.querySelectorAll('*')]; })();
    const snap = () => els.flatMap((el) => [null, '::before', '::after'].map((pseudo) => { const cs = getComputedStyle(el, pseudo); const o = {}; for (let i = 0; i < cs.length; i += 1) o[cs[i]] = cs.getPropertyValue(cs[i]); return o; }));
    // Properties that change between two snapshots of the same sheet (buffer progress) are noise.
    const diff = (a, b, noise = new Set()) => {
      const d = [];
      let n = 0;
      a.forEach((o, i) => {
        const el = els[Math.floor(i / 3)];
        for (const k of Object.keys(o)) {
          n += 1;
          if (o[k] !== b[i][k] && !noise.has(`${i}|${k}`)) d.push({ i, el: el.localName, k, line: `${el.localName}.${String(el.className?.baseVal ?? el.className).split(' ')[0]}${[null, '::before', '::after'][i % 3] ?? ''} ${k}: ${o[k]} -> ${b[i][k]}` });
        }
      });
      return { compared: n, differ: d.length, keys: d.map((x) => `${x.i}|${x.k}`), elements: [...new Set(d.map((x) => x.el))], properties: [...new Set(d.map((x) => x.k))], sample: d.slice(0, 6).map((x) => x.line) };
    };
    document.getElementById('skin-css').sheet.disabled = true;
    const sheets = { raw: sheet(raw), flat: sheet(flat) };
    document.adoptedStyleSheets = [sheets.flat]; await frames(); const f0 = snap();
    document.adoptedStyleSheets = [sheets.raw]; await frames(); const r = snap();
    document.adoptedStyleSheets = [sheets.flat]; await frames(); const f1 = snap();
    let rules = { raw: 0, flat: 0 };
    for (const k of Object.keys(rules)) { const walk = (list) => { for (const rule of list) { if (rule instanceof CSSStyleRule) rules[k] += 1; if (rule.cssRules && !(rule instanceof CSSKeyframesRule)) walk(rule.cssRules); } }; walk(sheets[k].cssRules); }
    const { keys, ...baseline } = diff(f0, f1);
    const { keys: _, ...rawVsFlat } = diff(r, f1, new Set(keys));
    return { elements: els.length, styleRulesParsed: rules, baseline, rawVsFlat };
  }, [readFileSync(join(buildDir, `${skin}.raw.css`), 'utf8'), readFileSync(join(buildDir, `${skin}.flat.css`), 'utf8')]);
  await context.close();
  return out;
}

async function browserRun() {
  const { chromium, firefox, webkit } = await import('@playwright/test');
  mkdirSync(join(buildDir, 'shots'), { recursive: true });
  results.browser = { media: MP4, bundles: {}, engines: {}, runs: [], styleDiff: {} };
  copyFileSync(join(here, 'fixtures', 'own-ui.css'), join(buildDir, 'own-ui.css'));
  for (const skin of SKINS) {
    writeFileSync(join(buildDir, `${skin}.html`), page(skin));
    results.browser.bundles[skin] = await bundle(skin);
  }
  const server = await serve(buildDir);
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
      const browser = await type.launch({ headless: true });
      results.browser.engines[engine] = browser.version();
      for (const skin of SKINS) {
        const run = await runSkin(browser, engine, skin, origin);
        results.browser.runs.push(run);
        results.browser.styleDiff[`${engine} ${skin}`] = await styleDiff(browser, skin, origin);
        const d = results.browser.styleDiff[`${engine} ${skin}`];
        console.log(`${engine} ${browser.version()} ${skin}: play ${run.play.playingEvent && !run.play.paused}, pause ${run.pause.pauseEvent && run.pause.paused}, seek ${run.seekPointer.seekedEvent && run.seekPointer.nearHalf}/${run.seekKey.moved}, own control ${run.ownControl.reactsToState} x${run.ownControl.activations}, overlay ${run.overlay.hitAtOverlayCenter}/${run.overlay.coverAllHitAtBarPlayButton}, fullscreen ${run.fullscreen.entered && run.fullscreen.containsOverlay && run.fullscreen.hitAtOverlayCenter}, raw-vs-flat diffs ${d.rawVsFlat.differ}/${d.rawVsFlat.compared} beyond noise (noise props: ${d.baseline.properties.join(' ') || 'none'}) on ${d.rawVsFlat.elements.join(' ') || '-'}, errors ${run.errors.length}`);
      }
      await browser.close();
    }
  } finally {
    server.close();
  }
}

// ------------------------------------------------------------------------------------------------ main
const steps = process.argv.slice(2);
const want = (s) => steps.length === 0 || steps.includes(s);
if (steps.includes('fetch') || (want('fetch') && !existsSync(join(here, 'ejected', 'manifest.json')))) await fetchSkins();
if (want('flatten')) flatten();
if (want('audit')) audit();
if (want('browser')) await browserRun();
results.versions = {
  '@videojs/html': require('@videojs/html/package.json').version,
  postcss: require('postcss/package.json').version,
  'postcss-selector-parser': require('postcss-selector-parser/package.json').version,
  lightningcss: lcssVersion,
  'caniuse-lite': require('caniuse-lite/package.json').version,
};
writeFileSync(join(here, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
