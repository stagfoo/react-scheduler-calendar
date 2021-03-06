export const getPos = (element: HTMLElement | null) => {
  let x = 0;
  let y = 0;
  while (element) {
    x += element.offsetLeft - element.scrollLeft;
    y += element.offsetTop - element.scrollTop;
    element = element.offsetParent as HTMLElement;
  }
  return { x, y };
};

export const getScrollSpeedRate = (distance: number, maxDistance: number) =>
  Math.exp((maxDistance - distance) / maxDistance * 2);
