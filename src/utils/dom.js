import { castArray } from './array';
import { isElement } from './type-inference';

const wrap = (el, wrapper) => {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);

  return wrapper;
};

const createElement = (elementName, attributes = {}, children) => {
  const element = document.createElement(elementName);

  for (let key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      element.setAttribute(key, attributes[key]);
    }
  }

  castArray(children).forEach(child => appendChild(child, element));

  return element;
};

const appendChild = (child, element) => {
  if (isElement(child)) {
    element.appendChild(child);
  } else if (child && typeof child !== 'object') {
    const text = document.createTextNode(child);
    element.appendChild(text);
  }
};

export const styleElement = (element, style) => {
  for (let key in style) {
    if (Object.prototype.hasOwnProperty.call(style, key)) {
      element.style[key] = style[key];
    }
  }

  return element;
};

const elementsCreator = (item) => {
  const children = Array.isArray(item.children) ? item.children.map(elementsCreator) : item.children;

  const element = isElement(item) ? item : createElement(item.tag, item.attr, children);

  if (item.onClick) {
    item.event = { name: 'click', callback: item.onClick };
  }

  if (item.event) {
    element.addEventListener(item.event.name, item.event.callback, false);
  }

  if (item.style) {
    styleElement(element, item.style);
  }

  return element;
};


const addEventListener = (element, name, cb) => {
  element.addEventListener(name, cb, false);

  return () => {
    element.removeEventListener(name, cb, false);
  };
};


export { wrap, createElement, elementsCreator, addEventListener };
