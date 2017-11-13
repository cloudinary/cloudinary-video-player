const wrap = (el, wrapper) => {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);

  return wrapper;
};

const setWidth = (el, width) => {
  el.style.width = `${width}px`;
};

const setHeight = (el, height) => {
  el.style.height = `${height}px`;
};

export { wrap, setWidth, setHeight };