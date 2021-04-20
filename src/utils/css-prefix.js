import { startsWith } from './string';
import defaults from '../config/defaults';
import { find } from './find';

export const CLASS_PREFIX = 'cld-video-player';
const SKIN_CLASS_PREFIX = `${CLASS_PREFIX}-skin-`;

export const playerClassPrefix = (componentInstance) => `${CLASS_PREFIX}-${componentInstance.id_}`;

export const skinClass = (skin) => `${SKIN_CLASS_PREFIX}${skin}`;

export const skinClassPrefix = (componentInstance) => {
  return find(componentInstance.el().classList, (cls) => startsWith(cls, SKIN_CLASS_PREFIX));
};

export const setSkinClassPrefix = (componentInstance, name) => {
  const currentSkinPrefix = skinClassPrefix(componentInstance);
  const skinName = name ? name.replace(SKIN_CLASS_PREFIX, '') : false;

  let newSkinPrefix = '';
  if (skinName) {
    // From html class
    newSkinPrefix = skinClass(skinName);
  } else if (componentInstance.options_.skin) {
    // From JS config
    newSkinPrefix = skinClass(componentInstance.options_.skin);
  } else {
    // Defult
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
