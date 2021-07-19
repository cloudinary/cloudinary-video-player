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

const elementsCreator = (item) => {
  const children = Array.isArray(item.children) ? item.children.map(elementsCreator) : item.children;

  const element = createElement(item.tag, item.attr, children);

  if (item.event) {
    element.addEventListener(item.event.name, item.event.callback, false);
  }

  if (item.style) {
    for (let key in item.style) {
      if (Object.prototype.hasOwnProperty.call(item.style, key)) {
        element.style[key] = item.style[key];
      }
    }
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
