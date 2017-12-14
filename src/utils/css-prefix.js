import { startsWith } from './string';
import defaults from '../config/defaults';
import { find } from './find';


const CLASS_PREFIX = 'cld-video-player';
const SKIN_CLASS_PREFIX = `${CLASS_PREFIX}-skin-`;

const skinClassPrefix = (componentInstance) => {
  let currentSkin = find(componentInstance.el().classList, (cls) => startsWith(cls, SKIN_CLASS_PREFIX));

  if (!currentSkin) {
    currentSkin = skinClass(defaults.skin);
  }

  return currentSkin;
};

const skinClass = (skin) => `${SKIN_CLASS_PREFIX}${skin}`;

const setSkinClassPrefix = (componentInstance, name) => {
  let currentSkinPrefix = skinClassPrefix(componentInstance);
  const newSkinPrefix = skinClass(name.replace(SKIN_CLASS_PREFIX, ''));

  if (newSkinPrefix !== currentSkinPrefix) {
    componentInstance.removeClass(currentSkinPrefix);
    componentInstance.addClass(newSkinPrefix);
    currentSkinPrefix = newSkinPrefix;
  }
};

export { CLASS_PREFIX, skinClassPrefix, skinClass, setSkinClassPrefix };
