import { startsWith } from './string';
import defaults from '../config/defaults';
import { find } from './find';


const CLASS_PREFIX = 'cld-video-player';
const SKIN_CLASS_PREFIX = `${CLASS_PREFIX}-skin-`;

const skinClassPrefix = (componentInstance) => {
  let currentSkin = find(componentInstance.el().classList, (cls) => startsWith(cls, SKIN_CLASS_PREFIX));
  return currentSkin;
};

const skinClass = (skin) => `${SKIN_CLASS_PREFIX}${skin}`;

const setSkinClassPrefix = (componentInstance, name) => {
  const currentSkinPrefix = skinClassPrefix(componentInstance);
  let newSkinPrefix = name ? skinClass(name.replace(SKIN_CLASS_PREFIX, '')) : false;

  if (!newSkinPrefix) {
    newSkinPrefix = skinClass(defaults.skin);
  }

  if (newSkinPrefix !== currentSkinPrefix) {
    if (currentSkinPrefix) {
      componentInstance.removeClass(currentSkinPrefix);
    }
    componentInstance.addClass(newSkinPrefix);
  }
};

export { CLASS_PREFIX, skinClassPrefix, skinClass, setSkinClassPrefix };
