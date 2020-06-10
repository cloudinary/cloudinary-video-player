import utils from '../src/utils';

describe('Strings test', () => {
  test('camelize', () => {
    expect(utils.camelize('test_me')).toBe('testMe');
  });
});
