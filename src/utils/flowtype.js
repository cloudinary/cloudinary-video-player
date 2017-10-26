import getSize from 'get-size';
import { addResizeListener } from './resize-events';
import assign from 'utils/assign';

const instances = [];

const clamp = (number, min, max) => Math.min(Math.max(number, min), max);

function update(instance) {
  const el = instance[0];
  const settings = instance[1];

  const elw = getSize(el).width;
  const width = clamp(elw, settings.minimum, settings.maximum);
  const fontBase = width / settings.fontRatio;
  const fontSize = clamp(fontBase, settings.minFont, settings.maxFont);

  el.style.fontSize = `${fontSize}px`;
}

// window.addEventListener('resize', function() {
  // for (let i = 0; i < instances.length; i++) {
    // update(instances[i]);
  // }
// });

function flowtype(el, settings) {
  settings = assign({
    maximum: 9999,
    minimum: 1,
    maxFont: 9999,
    minFont: 1,
    fontRatio: 35
  }, settings);

  const instance = [el, settings];

  addResizeListener(el, function() {
    update(instance);
  });

  instances.push(instance);
  update(instance);
}

export default flowtype;
