import { findPreset, type PresetPlayer } from '../presets/index.ts';
import { snippet, type Delivery } from './snippet.ts';

interface PlayerApi {
  videoPlayer?: (id: string, options: object) => { source?: (publicId: string) => unknown };
}

declare global {
  interface Window {
    /** Test contract of the examples site only (test-plan.md §4); never set by the library. */
    examples: { players: unknown[]; ready: Promise<void> };
    cloudinary?: PlayerApi;
  }
}

const DELIVERIES: Record<Delivery, string> = { cdn: 'Classic script', npm: 'npm import', element: 'Custom element' };

const params = new URLSearchParams(location.search);
const preset = findPreset(params.get('preset'));
const requested = params.get('delivery') ?? 'cdn';
const delivery: Delivery = requested in DELIVERIES ? (requested as Delivery) : 'cdn';
const players: unknown[] = [];

const byId = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject });
    document.head.append(script);
  });

const loadStyle = (href: string): void => {
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href }));
};

// Loads the player the way a customer page does in each delivery mode.
const loadPlayer = async (): Promise<PlayerApi> => {
  if (delivery === 'npm') {
    await import('cloudinary-video-player/cld-video-player.min.css');
    return (await import('cloudinary-video-player')) as PlayerApi;
  }
  loadStyle('./player.min.css');
  await loadScript('./player.min.js');
  return window.cloudinary ?? {};
};

const createMedia = (id: string, player: PresetPlayer): HTMLElement => {
  if (delivery === 'element') {
    const element = document.createElement('cld-video-player');
    element.id = id;
    Object.assign(element, { options: { ...player.options, publicId: player.source } });
    return element;
  }
  return Object.assign(document.createElement('video'), { id, className: 'cld-video-player', controls: true, muted: true });
};

const codePanel = (code: string): HTMLElement => {
  const panel = document.createElement('div');
  panel.className = 'code';
  const pre = document.createElement('pre');
  pre.append(Object.assign(document.createElement('code'), { textContent: code }));
  const button = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Copy code' });
  const status = Object.assign(document.createElement('span'), { className: 'visually-hidden' });
  status.setAttribute('role', 'status');
  button.addEventListener('click', async () => {
    const copied = await navigator.clipboard.writeText(code).then(() => true, () => false);
    status.textContent = button.textContent = copied ? 'Copied' : 'Copy failed';
    setTimeout(() => (button.textContent = 'Copy code'), 2000);
  });
  panel.append(pre, button, status);
  return panel;
};

const renderDeliveryNav = (presetId: string): void => {
  const items = Object.entries(DELIVERIES).map(([mode, label]) => {
    const link = Object.assign(document.createElement('a'), { href: `?preset=${presetId}&delivery=${mode}`, textContent: label });
    if (mode === delivery) link.setAttribute('aria-current', 'page');
    const item = document.createElement('li');
    item.append(link);
    return item;
  });
  byId('delivery').replaceChildren(...items);
};

const render = async (): Promise<void> => {
  const container = byId('players');
  if (!preset) {
    byId('title').textContent = 'Example not found';
    const alert = Object.assign(document.createElement('p'), { textContent: `No preset named "${params.get('preset') ?? ''}".` });
    alert.setAttribute('role', 'alert');
    container.replaceChildren(alert);
    return;
  }
  document.title = `${preset.title} · Cloudinary Video Player`;
  byId('title').textContent = preset.title;
  renderDeliveryNav(preset.id);
  container.classList.toggle('layout-scroll', preset.layout === 'scroll');
  container.setAttribute('aria-busy', 'true');
  const api = await loadPlayer();
  preset.players.forEach((player, index) => {
    const id = `player-${index + 1}`;
    const section = Object.assign(document.createElement('section'), { className: 'player' });
    section.setAttribute('aria-label', preset.players.length > 1 ? `${preset.title} ${index + 1}` : preset.title);
    section.append(createMedia(id, player), codePanel(snippet(id, player, delivery)));
    container.append(section);
    // The factories arrive with the shell (Phase 3); until then the page only loads the player files.
    const instance = delivery === 'element' ? undefined : api.videoPlayer?.(id, player.options);
    if (!instance) return;
    if (player.source) instance.source?.(player.source);
    player.setup?.(instance);
    players.push(instance);
  });
  container.removeAttribute('aria-busy');
};

window.examples = { players, ready: render() };
