import { isValidConfig } from '../src/validators/validators-functions';
import { validator } from '../src/validators/validators-types';
import { noop } from '../src/utils/type-inference';

describe('test isValidConfig method', () => {

  describe('should be a number', () => {

    const validators = {
      test: validator.isNumber
    };

    it('is valid number', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid number', () => {
      const isValid = isValidConfig({
        test: 'a'
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be a string', () => {

    const validators = {
      test: validator.isString
    };

    it('is valid string', () => {
      const isValid = isValidConfig({
        test: 'a'
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid string', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be a boolean', () => {

    const validators = {
      test: validator.isBoolean
    };

    it('is valid boolean', () => {
      const isValid = isValidConfig({
        test: true
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid boolean', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be a function', () => {

    const validators = {
      test: validator.isFunction
    };

    it('is valid function', () => {
      const isValid = isValidConfig({
        test: noop
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid function', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be an array Of strings', () => {

    const validators = {
      test: validator.isArrayOfStrings
    };

    it('is valid array of strings', () => {
      const isValid = isValidConfig({
        test: ['a', 'b', 'c']
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid array of strings', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be an array Of numbers', () => {

    const validators = {
      test: validator.isArrayOfNumbers
    };

    it('is valid array of numbers', () => {
      const isValid = isValidConfig({
        test: [1, 1, 1]
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid array of numbers', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be an object', () => {
    const validators = {
      test: validator.isPlainObject
    };

    it('is valid object', () => {
      const isValid = isValidConfig({
        test: { a: 1 }
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid object', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(false);
    });
  });

  describe('should be an array of object', () => {
    const validators = {
      test: validator.isArrayOfObjects({
        a: validator.isString,
        b: validator.isNumber,
        c: validator.isBoolean
      })
    };
    it('is valid array of object', () => {
      const isValid = isValidConfig({
        test: [{ a: 'a', b: 1, c: true }]
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid object', () => {
      const isValid = isValidConfig({
        test: [{ a: 'a', b: 1, c: 1 }]
      }, validators);

      expect(isValid).toBe(false);
    });
  });


  describe('or validator', () => {
    const validators = {
      test: validator.or(validator.isNumber, validator.isString)
    };

    it('could be a number', () => {
      const isValid = isValidConfig({
        test: 1
      }, validators);

      expect(isValid).toBe(true);
    });

    it('could be a string', () => {
      const isValid = isValidConfig({
        test: 'a'
      }, validators);

      expect(isValid).toBe(true);
    });

    it('is invalid or', () => {
      const isValid = isValidConfig({
        test: true
      }, validators);

      expect(isValid).toBe(false);
    });
  });


});
