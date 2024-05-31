
export enum Direction {
  UP_LEFT = 'UP_LEFT',
  UP_RIGHT = 'UP_RIGHT',
  DOWN_LEFT = 'DOWN_LEFT',
  DOWN_RIGHT = 'DOWN_RIGHT',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}


export type PointXY = {
  x: number;
  y: number;
}


export function geHexGridDelta(currentY: number, direction: Direction): PointXY {
  switch (direction) {
    case Direction.UP_LEFT:
      return {
        x: currentY % 2 === 0 ? 0 : -1,
        y: -1,
      };
    case Direction.UP_RIGHT:
      return {
        x: currentY % 2 === 0 ? 1 : 0,
        y: -1,
      };
    case Direction.DOWN_LEFT:
      return {
        x: currentY % 2 === 0 ? 0 : -1,
        y: 1,
      };
    case Direction.DOWN_RIGHT:
      return {
        x: currentY % 2 === 0 ? 1 : 0,
        y: 1,
      };
    case Direction.LEFT:
      return {
        x: -1,
        y: 0,
      };
    case Direction.RIGHT:
      return {
        x: 1,
        y: 0,
      };
  }
}
