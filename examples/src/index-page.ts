import { presets, type Preset } from '../presets/index.ts';

const byFeature = new Map<string, Preset[]>();
for (const preset of presets) byFeature.set(preset.feature, [...(byFeature.get(preset.feature) ?? []), preset]);
const sections = [...byFeature].map(([feature, list]) => {
  const section = document.createElement('section');
  section.append(Object.assign(document.createElement('h2'), { textContent: feature }));
  const items = list.map((preset) => {
    const item = document.createElement('li');
    item.append(Object.assign(document.createElement('a'), { href: `./player.html?preset=${preset.id}`, textContent: preset.title }));
    return item;
  });
  const ul = document.createElement('ul');
  ul.append(...items);
  section.append(ul);
  return section;
});
document.getElementById('presets')?.replaceChildren(...sections);
