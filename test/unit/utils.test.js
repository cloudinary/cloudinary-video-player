import { get } from '../../src/utils/object.js';

describe('test get utils function', () => {
  const value = { a: { b: [{ c: 2 }], d: undefined } };

  it('should get primitive value', () => {
    expect(get(value, 'a.b.0.c')).toBe(value.a.b[0].c);
  });

  it('should get object value', () => {
    expect(get(value, 'a.b')).toBe(value.a.b);
  });

  it('should get default value', () => {
    const defaultValue = 10;
    expect(get(value, 'a.c', defaultValue)).toBe(defaultValue);
  });

  it('should get default value if value is undefined', () => {
    expect(get(value, 'a.d', 10)).toBe(10);
  });

  it('should get default value if the value is not an object', () => {
    expect(get(1, 'a.b', 12)).toBe(12);
  });

});
