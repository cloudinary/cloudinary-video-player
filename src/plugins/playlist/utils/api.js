import camelCase from 'lodash/camelCase';
import isObject from 'lodash/isObject';
import { parseISO8601 } from './time';

const TIME_FIELDS = ['created_at', 'updated_at'];

const normalizeJsonResponse = (obj) => {
  const agg = {};

  if (isObject(obj)) {
    Object.keys(obj).reduce((agg, key) => {
      const newKey = camelCase(key);

      if (TIME_FIELDS.indexOf(key) !== -1) {
        agg[newKey] = new Date(parseISO8601(obj[key]));
      } else {
        agg[newKey] = normalizeJsonResponse(obj[key]);
      }

      return agg;
    }, agg);

    return agg;
  } else if (Array.isArray(obj)) {
    return obj.map((item) => normalizeJsonResponse(item));
  } else {
    return obj;
  }
};


export { normalizeJsonResponse };
