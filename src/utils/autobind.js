function autobind(instance, proto) {
  if (!proto) {
    proto = Object.getPrototypeOf(instance);
  }

  const propertyNames = Object.getOwnPropertyNames(proto);

  for (const name of propertyNames) {
    const value = proto[name];

    if (typeof value === 'function') {
      instance[name] = proto[name].bind(instance);
    }
  }
}


export default autobind;
