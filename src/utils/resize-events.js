// import debounce from './debounce';

// const DEBOUNCE_TIME = 200;

const isIE = navigator.userAgent.match(/Trident/);

const requestFrame = (function() {
  const raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
      function(fn) {
        return window.setTimeout(fn, 20);
      };
  return (fn) => raf(fn);
}());

const cancelFrame = (function() {
  const cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
    window.clearTimeout;
  return (id) => cancel(id);
}());

const addResizeListener = function(element, fn) {
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    const obj = element.__resizeTrigger__ = document.createElement('object');
    obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
    obj.__resizeElement__ = element;
    obj.onload = objectLoad.bind(obj);
    obj.type = 'text/html';
    if (isIE) {
      element.appendChild(obj);
    }
    obj.data = 'about:blank';
    if (!isIE) {
      element.appendChild(obj);
    }
  }

  element.__resizeListeners__.push(fn);
};

const resizeTriggers = {};

function objectLoad() {
  const win = this.contentDocument.defaultView;
  win.__id = `id_${Math.round(Math.random() * 10000)}`;
  resizeTriggers[win.__id] = this.__resizeElement__;
  win.addEventListener('resize', resizeListener);
  // this.contentDocument.defaultView.addEventListener('resize', debounce(resizeListener, DEBOUNCE_TIME));
}

const removeResizeListener = (element, fn) => {
  element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
  if (!element.__resizeListeners__.length) {
    element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
    element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
  }
};

const resizeListeners = {};

const resizeListener = function(e) {
  const win = e.target || e.srcElement;

  if (resizeListeners[win.__id]) {
    cancelFrame(resizeListeners[win]);
  }

  resizeListeners[win] = requestFrame(function() {
    const trigger = resizeTriggers[win.__id];
    trigger.__resizeListeners__.forEach((fn) => {
      fn.call(trigger, e);
    });
  });
};

module.exports = { addResizeListener, removeResizeListener };
