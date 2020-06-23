import { getPos, getScrollSpeedRate } from '../Util';

describe('get scroll speed rate', () => {
  it('should return 3 given distance and maxDistance 6 add 10', () => {
    expect(getScrollSpeedRate(5, 10)).toEqual(Math.exp(1));
  });
});

describe('get position', () => {
  it('should return 0 0 when given element null', () => {
    expect(getPos(null)).toEqual({ x: 0, y: 0 });
  });
});
