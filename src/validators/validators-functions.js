import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';


export const getValidatorItem = (validator) => isFunction(validator) ? validator() : validator;

/**
 * check if a value is valid or not
 * @param  {object | function} validator -  a config object
 * @param  {any} value
 * @param  {key} string
 * @returns boolean - using the validators to check if the value is a valid value or not
 */
export const isValueValid = (validator, value, configPropertyName) => {
  const validatorItem = getValidatorItem(validator);
  const isValid = validatorItem.value(value);

  if (!isValid) {
    console.error(`cloudinary video player: ${validatorItem.message(configPropertyName)}`);
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
  if (isObject(validators)) {
    for (let key in config) {
      if (Object.prototype.hasOwnProperty.call(validators, key)) {
        const configValue = config[key];
        const validatorValue = validators[key];
        const isConfigObject = isObject(configValue);

        if (isConfigObject && !isValidConfig(configValue, validatorValue)) {
          return false;
        } else if (!isConfigObject && !isValueValid(validatorValue, configValue, key)) {
          return false;
        }
      }
    }
  }

  return true;
};
