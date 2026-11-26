// Own stand-in for `@tsdown/css` with `splitting: true` (that package is not
// installed here). Same naming rule as @tsdown/css 0.23.7 (read from its
// published source): one CSS file per JS chunk, named after the chunk
// (`x-HASH.js` → `x-HASH.css`). Works as a plain Rolldown plugin and inside
// tsdown (with `css: false`). Minify with Lightning CSS (already installed).
import { readFileSync } from 'node:fs';
import { transform } from 'lightningcss';

export function cssSplit({ minify = true, readCss = (id) => readFileSync(id, 'utf8') } = {}) {
  const styles = new Map();
  return {
    name: 's6:css-split',
    load: {
      filter: { id: /\.css$/ },
      handler(id) {
        styles.set(id, readCss(id));
        // Keep the (empty) module so it stays in chunk.moduleIds.
        return { code: '', moduleSideEffects: 'no-treeshake', moduleType: 'js' };
      },
    },
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const css = chunk.moduleIds.filter((id) => styles.has(id)).map((id) => styles.get(id)).join('\n');
        if (!css) continue;
        const source = minify ? transform({ filename: chunk.fileName, code: Buffer.from(css), minify: true }).code : css;
        this.emitFile({ type: 'asset', fileName: chunk.fileName.replace(/\.js$/, '.css'), source });
      }
    },
  };
}
