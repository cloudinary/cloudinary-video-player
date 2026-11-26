// The 19 cases of the v4 `test/isValidConfig.test.js` (master), ported to the v5 validator primitives.
import { describe, expect, it } from 'vitest';
import {
  type Spec,
  invalidPaths,
  isArrayOfNumbers,
  isArrayOfObjects,
  isArrayOfStrings,
  isBoolean,
  isFunction,
  isNumber,
  isPlainObject,
  isString,
  or,
} from '../../../src/core/options/validate.ts';

const isValidConfig = (config: Record<string, unknown>, specs: Record<string, Spec>): boolean =>
  invalidPaths(config, specs).length === 0;

const cases: Array<[string, Spec, unknown, boolean]> = [
  ['is valid number', isNumber, 1, true],
  ['is invalid number', isNumber, 'a', false],
  ['is valid string', isString, 'a', true],
  ['is invalid string', isString, 1, false],
  ['is valid boolean', isBoolean, true, true],
  ['is invalid boolean', isBoolean, 1, false],
  ['is valid function', isFunction, () => {}, true],
  ['is invalid function', isFunction, 1, false],
  ['is valid array of strings', isArrayOfStrings, ['a', 'b', 'c'], true],
  ['is invalid array of strings', isArrayOfStrings, 1, false],
  ['is valid array of numbers', isArrayOfNumbers, [1, 1, 1], true],
  ['is invalid array of numbers', isArrayOfNumbers, 1, false],
  ['is valid object', isPlainObject, { a: 1 }, true],
  ['is invalid object', isPlainObject, 1, false],
  ['is valid array of objects', isArrayOfObjects({ a: isString, b: isNumber, c: isBoolean }), [{ a: 'a', b: 1, c: true }], true],
  ['is invalid array of objects', isArrayOfObjects({ a: isString, b: isNumber, c: isBoolean }), [{ a: 'a', b: 1, c: 1 }], false],
  ['or: could be a number', or(isNumber, isString), 1, true],
  ['or: could be a string', or(isNumber, isString), 'a', true],
  ['or: is invalid', or(isNumber, isString), true, false],
];

describe('validator primitives (v4 isValidConfig cases)', () => {
  it.each(cases)('%s', (_name, spec, value, expected) => {
    expect(isValidConfig({ test: value }, { test: spec })).toBe(expected);
  });

  it('names the path of an invalid nested value', () => {
    expect(invalidPaths({ colors: { base: '#000', accent: 1 } }, { colors: { base: isString, accent: isString } })).toEqual([
      'colors.accent',
    ]);
  });
});
