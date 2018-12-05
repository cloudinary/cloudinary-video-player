import utils from '../src/utils';

describe('Strings test', () => {
  test('Capitalize', () => {
    let good = utils.capitalize('you');
    expect(good).toBe('You');
    let last = utils.capitalize('yoU');
    expect(last).toBe('You');
  });
  test('camelize', () => {
    expect(utils.camelize('test_me')).toBe('testMe');
  });
});
