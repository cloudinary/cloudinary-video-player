import { toCamelCase } from './string';

export const flatten = function (data) {
  let obj = {};
  let result = [];
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      obj[prop] = cur;
      result.push(`${prop}=${encodeURIComponent(cur)}`);
    } else if (Array.isArray(cur)) {
      // Variables declared with var are not local to the loop
      // Variables declared with let are local to the statement.
      // eslint-disable-next-line no-var
      for (let i = 0, l = cur.length; i < l; i++) {
        recurse(cur[i], prop ? toCamelCase(`${prop} ${i}`) : `${i}`);
      }

      if (cur.length === 0) {
        obj[prop] = [];
      }
    } else {
      let isEmpty = true;
      // eslint-disable-next-line guard-for-in
      for (let p in cur) {
        if (Object.hasOwn(cur, p)) {
          isEmpty = false;
          recurse(cur[p], prop ? toCamelCase(`${prop} ${p}`) : p);
        }
      }

      if (isEmpty) {
        obj[prop] = {};
      }
    }
  };
  recurse(data, '');

  return result.join('&');
};
