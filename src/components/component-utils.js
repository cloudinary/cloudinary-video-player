const hide = (el) => {
  el.style.display = 'none';
};

const show = (el) => {
  el.style.display = '';
};

const setText = (el, text) => {
  if (!text || text.length <= 0) {
    el.innerText = '';
    hide(el);
    return;
  }

  el.innerText = text;
  show(el);
};

module.exports = { hide, show, setText };
