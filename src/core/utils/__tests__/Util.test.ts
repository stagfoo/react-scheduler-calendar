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

  it('should return 0 0 when given element 222', () => {
    const newDiv = document.createElement('div');
    Object.defineProperties(newDiv, {
      offsetLeft: { value: 10 },
      scrollLeft: { value: 5 },
      offsetTop: { value: 20 },
      scrollTop: { value: 10 },
    });
    expect(getPos(newDiv)).toEqual({ x: 5, y: 10 });
  });
});
