import snakeCase from 'lodash/snakeCase';

export const convertKeysToSnakeCase = (obj) => {
  let snakeCaseObj = {};

  for (const key of Object.keys(obj)) {
    const snakeCaseKey = snakeCase(key);
    snakeCaseObj[snakeCaseKey] = obj[key];
  }

  return snakeCaseObj;
};
