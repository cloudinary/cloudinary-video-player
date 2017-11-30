function getElementPosition(el) {
  const box = el.getBoundingClientRect();

  const body = document.body;
  const docEl = document.documentElement;

  const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  return {
    top: Math.round(top),
    left: Math.round(left)
  };
}

/**
 * Get pointer position in element
 * Returns an object with x and y coordinates.
 * The base on the coordinates are the bottom left of the element.
 *
 * @function getPointerPosition
 * @param {Element} el Element on which to get the pointer position on
 * @param {Event} event Event object
 * @return {Object}
 *         This object will have x and y coordinates corresponding to the
 *         mouse position
 */
function getPointerPosition(el, event) {
  const position = {};
  const box = getElementPosition(el);
  const boxW = el.offsetWidth;
  const boxH = el.offsetHeight;
  const boxY = box.top;
  const boxX = box.left;
  let pageY = event.pageY;
  let pageX = event.pageX;

  if (event.changedTouches) {
    pageX = event.changedTouches[0].pageX;
    pageY = event.changedTouches[0].pageY;
  }

  position.y = Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH));
  position.x = Math.max(0, Math.min(1, (pageX - boxX) / boxW));

  return position;
}

function isElementInViewport(el, { fraction }) {
  const topLeft = getElementPosition(el);
  const x = topLeft.left;
  const y = topLeft.top;
  const h = el.offsetHeight;
  const w = el.offsetWidth;
  const r = x + w;
  const b = y + h;
  const visibleX = Math.max(0, Math.min(w, window.pageXOffset + window.innerWidth - x,
    r - window.pageXOffset));
  const visibleY = Math.max(0, Math.min(w, window.pageYOffset + window.innerHeight - y,
    b - window.pageYOffset));

  const visible = visibleX * visibleY / (w * h);

  return visible > fraction;
}

function setPosition(el, left, top) {
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

export { getElementPosition, getPointerPosition, isElementInViewport, setPosition };
