
export enum Direction {
  UP_LEFT = 'UP_LEFT',
  UP_RIGHT = 'UP_RIGHT',
  DOWN_LEFT = 'DOWN_LEFT',
  DOWN_RIGHT = 'DOWN_RIGHT',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export const DIRECTIONS = [
  Direction.UP_LEFT,
  Direction.UP_RIGHT,
  Direction.DOWN_LEFT,
  Direction.DOWN_RIGHT,
  Direction.LEFT,
  Direction.RIGHT,
];


export type PointXY = [number, number];
export type PointXYZ = [number, number, number];


export function getHexGridDelta(currentY: number, direction: Direction): PointXY {
  switch (direction) {
    case Direction.UP_LEFT:
      return [
        currentY % 2 === 0 ? 0 : -1,
        -1,
      ];
    case Direction.UP_RIGHT:
      return [
        currentY % 2 === 0 ? 1 : 0,
        -1,
      ];
    case Direction.DOWN_LEFT:
      return [
        currentY % 2 === 0 ? 0 : -1,
        1,
      ];
    case Direction.DOWN_RIGHT:
      return [
        currentY % 2 === 0 ? 1 : 0,
        1,
      ];
    case Direction.LEFT:
      return [
        -1,
        0,
      ];
    case Direction.RIGHT:
      return [
        1,
        0,
      ];
  }
}
