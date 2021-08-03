import { isFunction, isPlainObject } from '../utils/type-inference';
import { castArray } from '../utils/array';

const getValidators = (validator) => isFunction(validator) ? validator() : validator;

export const isValueValid = (validators, value, key) => {
  let invalidItem = null;

  const isValid = castArray(validators).some((validator) => {
    const validatorItem = getValidators(validator);
    const isValid = validatorItem.value(value);
    invalidItem = isValid ? null : validatorItem;
    return isValid;
  });

  if (invalidItem) {
    const validatorItem = getValidators(invalidItem);
    console.error(`cloudinary video player: ${validatorItem.message(key)}`);
  }

  return isValid;
};

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
