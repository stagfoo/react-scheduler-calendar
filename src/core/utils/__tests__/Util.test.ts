import { getPos, getScrollSpeedRate } from '../Util';

describe('getScrollSpeedRate', () => {
  it('should return 3 given distance and maxDistance 6 add 10', () => {
    expect(getScrollSpeedRate(5, 10)).toEqual(Math.exp(1));
  });
});

describe('getPos', () => {
  it('should return 0 0 when given element null', () => {
    expect(getPos(null)).toEqual({ x: 0, y: 0 });
  });

  it('should return 5 10 when given element with offsetLeft 10 scrollLeft 5 offsetTop 20 and scrollTop 10 ', () => {
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
