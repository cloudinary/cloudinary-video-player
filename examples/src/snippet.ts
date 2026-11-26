import type { PresetPlayer } from '../presets/index.ts';

export type Delivery = 'cdn' | 'npm' | 'element';

const CDN = 'https://cdn.jsdelivr.net/npm/cloudinary-video-player@5/dist';
const kebab = (key: string): string => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const attribute = (key: string, value: unknown): string =>
  `${kebab(key)}="${typeof value === 'object' ? JSON.stringify(value).replaceAll('"', '&quot;') : String(value)}"`;

/** The code a customer writes for one player in the given delivery mode. */
export const snippet = (id: string, player: PresetPlayer, delivery: Delivery): string => {
  const options = JSON.stringify(player.options, null, 2).replaceAll('\n', '\n  ');
  const source = player.source ? `\nplayer.source('${player.source}');` : '';
  if (delivery === 'element') {
    const attributes = Object.entries({ ...player.options, publicId: player.source })
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => attribute(key, value));
    return `<script src="${CDN}/player.min.js"></script>\n<link rel="stylesheet" href="${CDN}/player.min.css">\n\n<cld-video-player ${attributes.join(' ')} controls muted></cld-video-player>`;
  }
  const create = `const player = ${delivery === 'npm' ? '' : 'cloudinary.'}videoPlayer('${id}', ${options});${source}`;
  if (delivery === 'npm') {
    return `import { videoPlayer } from 'cloudinary-video-player';\nimport 'cloudinary-video-player/cld-video-player.min.css';\n\n// <video id="${id}" class="cld-video-player" controls muted></video>\n${create}`;
  }
  return `<link rel="stylesheet" href="${CDN}/player.min.css">\n<script src="${CDN}/player.min.js"></script>\n\n<video id="${id}" class="cld-video-player" controls muted></video>\n<script>\n  ${create.replaceAll('\n', '\n  ')}\n</script>`;
};
