import { startsWith } from './string';
import defaults from '../config/defaults';
import { find } from './find';

const CLASS_PREFIX = 'cld-video-player';
const SKIN_CLASS_PREFIX = `${CLASS_PREFIX}-skin-`;

const skinClass = (skin) => `${SKIN_CLASS_PREFIX}${skin}`;

const skinClassPrefix = (componentInstance) => {
  let currentSkin = find(componentInstance.el().classList, (cls) => startsWith(cls, SKIN_CLASS_PREFIX));

  return currentSkin;
};

const setSkinClassPrefix = (componentInstance, name) => {
  const currentSkinPrefix = skinClassPrefix(componentInstance);
  const skinName = name ? name.replace(SKIN_CLASS_PREFIX, '') : false;

  let newSkinPrefix = '';
  if (skinName) {
    newSkinPrefix = skinClass(skinName);
  } else if (componentInstance.options_.skin) {
    newSkinPrefix = skinClass(componentInstance.options_.skin);
  } else {
    newSkinPrefix = skinClass(defaults.skin);
  }

  if (newSkinPrefix !== currentSkinPrefix) {
    if (currentSkinPrefix) {
      componentInstance.removeClass(currentSkinPrefix);
    }
    componentInstance.addClass(newSkinPrefix);
  }

  if (skinName && componentInstance.options_.skin !== skinName) {
    componentInstance.options_.skin = skinName;
  }

};

export { CLASS_PREFIX, skinClassPrefix, skinClass, setSkinClassPrefix };
