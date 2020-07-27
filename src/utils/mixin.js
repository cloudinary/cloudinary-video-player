function mixin(...mixins) {
  return mixins.reduce((c, mixin) => mixin(c), class Blank {});
}

export { mixin };
