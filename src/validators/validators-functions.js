import { isFunction, isPlainObject } from '../utils/type-inference';
import { castArray } from '../utils/array';

const getValidators = (validator) => isFunction(validator) ? validator() : validator;

/**
 * check if a value is valid or not
 * @param  {object} validators -  a config object
 * @param  {any} value
 * @param  {key} string
 * @returns boolean - using the validators to check if the value is a valid value or not
 */
export const isValueValid = (validators, value, key) => {
  const validatorsArray = castArray(validators);
  const isValid = validatorsArray.some((validator) => getValidators(validator).value(value));
  const invalidItem = validatorsArray.find((validator) => !getValidators(validator).value(value));

  if (invalidItem) {
    const validatorItem = getValidators(invalidItem);
    console.error(`cloudinary video player: ${validatorItem.message(key)}`);
  }

  return isValid;
};

/**
 * check if a configuration object is valid or not
 * @param  {object} config -  a config object
 * @param  {object} validators
 * @returns boolean - true is the configuration object is valid and false if it is not
 */
export const isValidConfig = (config, validators) => {
  if (isPlainObject(validators)) {
    for (let key in config) {
      if (Object.prototype.hasOwnProperty.call(validators, key)) {
        const configValue = config[key];
        const validatorValue = validators[key];
        const isObject = isPlainObject(configValue);

        if (isObject && !isValidConfig(configValue, validatorValue)) {
          return false;
        } else if (!isObject && !isValueValid(validatorValue, configValue, key)) {
          return false;
        }
      }
    }
  }

  return true;
};
