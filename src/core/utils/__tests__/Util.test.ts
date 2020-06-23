import { getScrollSpeedRate } from '../Util';

describe('get scroll speed rate', () => {
  it('should return 3 given distance and maxDistance 6 add 10', () => {
    expect(getScrollSpeedRate(5, 10)).toEqual(Math.exp(1));
  });
});
