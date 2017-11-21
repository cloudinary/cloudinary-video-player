import assign from './assign';

function applyWithProps(context, obj, { order = null } = {}) {
  let _obj = obj;

  const apply = (key) => {
    const value = obj[key];
    if (value === undefined) {
      return;
    }

    if (context[key] && typeof context[key] === 'function') {
      context[key](value);
    }
  };

  if (order) {
    _obj = assign({}, obj);

    order.forEach((key) => {
      apply(key);
      delete _obj[key];
    });
  }

  Object.keys(_obj).forEach((key => {
    apply(key);
  }));
}

export default applyWithProps;
