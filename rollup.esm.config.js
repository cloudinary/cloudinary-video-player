const path = require('path');
const { babel } = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const { copyFileSync, mkdirSync, existsSync } = require('fs');

const pkg = require('./package.json');

const srcDir = path.resolve(__dirname, 'src');
const outDir = path.resolve(__dirname, 'lib');

const STUB_MODULE_ID = '\0stub-scss';

/**
 * Resolve ~/ imports to src paths (e.g. ~/utils/slicing -> src/utils/slicing.js).
 */
function srcPathAlias() {
  return {
    name: 'src-path-alias',
    resolveId(id) {
      if (!id.startsWith('~/')) return null;
      if (id.endsWith('.scss') || id.endsWith('.css')) return null;
      const resolved = path.join(srcDir, id.slice(2));
      return resolved.endsWith('.js') || resolved.endsWith('.json') ? resolved : `${resolved}.js`;
    }
  };
}

/**
 * Alias video.js to the core build and expose as window.videojs
 * (mirrors webpack expose-loader config).
 */
function videoJsAlias() {
  const PROXY_ID = '\0videojs-proxy';
  const corePath = path.resolve(__dirname, 'node_modules/video.js/dist/alt/video.core.js').replace(/\\/g, '/');

  return {
    name: 'video-js-alias',
    resolveId(id) {
      if (id === 'video.js') {
        return PROXY_ID;
      }
      return null;
    },
    load(id) {
      if (id === PROXY_ID) {
        return [
          `import _vjs from '${corePath}';`,
          `if (typeof window !== 'undefined') window.videojs = _vjs;`,
          `export default _vjs;`
        ].join('\n');
      }
      return null;
    }
  };
}

/**
 * Stub .scss and .css imports - ESM consumers import CSS separately.
 */
function stubScss() {
  return {
    name: 'stub-scss',
    resolveId(id) {
      if (id.endsWith('.scss') || id.endsWith('.css')) {
        return STUB_MODULE_ID;
      }
      return null;
    },
    load(id) {
      if (id === STUB_MODULE_ID) return 'export default {}';
      return null;
    }
  };
}

module.exports = {
  input: {
    index: path.join(srcDir, 'index.js'),
    videoPlayer: path.join(srcDir, 'index.videoPlayer.js'),
    player: path.join(srcDir, 'index.player.js'),
    all: path.join(srcDir, 'index.all.js'),
    lazy: path.join(srcDir, 'index.lazy.js'),
    dash: path.join(srcDir, 'dash.js'),
    debug: path.join(srcDir, 'debug.js')
  },
  output: {
    dir: outDir,
    format: 'esm',
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js'
  },
  plugins: [
    replace({
      include: path.join(srcDir, '**'),
      VERSION: JSON.stringify(pkg.version),
      preventAssignment: true
    }),
    videoJsAlias(),
    srcPathAlias(),
    stubScss(),
    stripStyleImport(),
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      configFile: path.join(__dirname, 'babel.config.js'),
      exclude: 'node_modules/**'
    }),
    {
      name: 'copy-assets',
      writeBundle() {
        const schemaSrc = path.join(__dirname, 'src/config/configSchema.json');
        const schemaDest = path.join(outDir, 'config/configSchema.json');
        if (existsSync(schemaSrc)) {
          mkdirSync(path.dirname(schemaDest), { recursive: true });
          copyFileSync(schemaSrc, schemaDest);
        }
        const cssSrc = path.join(__dirname, 'dist/cld-video-player.min.css');
        const cssDest = path.join(__dirname, 'lib/cld-video-player.min.css');
        if (existsSync(cssSrc)) {
          mkdirSync(path.dirname(cssDest), { recursive: true });
          copyFileSync(cssSrc, cssDest);
        }
      }
    }
  ]
};
