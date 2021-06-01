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
    if (attributes[key]) {
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


export { wrap, createElement };
