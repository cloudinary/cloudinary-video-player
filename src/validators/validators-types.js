import { isBoolean, isFunction, isNumber, isPlainObject, isString } from '../utils/type-inference';
import { getValidatorItem, isValueValid } from './validators-functions';
import { some, map } from '../utils/array';

const getOptionsString = (options) => isPlainObject(options) ? `:(${Object.values(options).join('/')})` : '';

const arrayOfStringsValidator = () => ({
  value: (arr) => Array.isArray(arr) && arr.every(isString),
  message: (key) => `'${key}' should be an array of strings`
});

const arrayOfNumbersValidator = () => ({
  value: (arr) => Array.isArray(arr) && arr.every(isNumber),
  message: (key) => `'${key}' should be an array of numbers`
});

const arrayOfObjectsValidator = (options) => ({
  value: (arr) => {
    return arr.every((item) => {
      for (let key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const value = item[key];
          const validator = options[key];
          const isValid = validator && isValueValid(validator(value), value, key);

          if (!isValid) {
            return false;
          }
        }
      }

      return true;
    });
  },
  message: () => 'invalid array'
});

const orValidator = (...validators) => {
  return () => ({
    value: (value) => some(validators, (validator) => getValidatorItem(validator).value(value)),
    message: (configPropertyName) => map(validators, (validator) => getValidatorItem(validator).message(configPropertyName)).join(' or ')
  });
};

export const validator = {
  isString: (options) => ({
    value: isString,
    message: (key) => `'${key}' should be a string${getOptionsString(options)}`
  }),
  isNumber: (options) => ({
    value: isNumber,
    message: (key) => `'${key}' should be a number${getOptionsString(options)}`
  }),
  isBoolean: () => ({
    value: isBoolean,
    message: (key) => `'${key}' should be a boolean`
  }),
  isFunction: () => ({
    value: isFunction,
    message: (key) => `'${key}' should be a function`
  }),
  isPlainObject: () => ({
    value: isPlainObject,
    message: (key) => `'${key}' should be an object`
  }),
  isObject: () => ({
    value: (value) => value && typeof value === 'object',
    message: (key) => `'${key}' should be an object`
  }),
  isArray: () => ({
    value: Array.isArray,
    message: (key) => `'${key}' should be an array`
  }),
  isArrayOfNumbers: arrayOfNumbersValidator,
  isArrayOfStrings: arrayOfStringsValidator,
  isArrayOfObjects: arrayOfObjectsValidator,
  or: orValidator
};
