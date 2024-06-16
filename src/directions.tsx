
/**
 * Cardinal directions
 * for Hex Grid
 */
export enum Direction {
  NORTH_WEST = 'UP_LEFT',
  NORTH_EAST = 'UP_RIGHT',
  SOUTH_WEST = 'DOWN_LEFT',
  SOUTH_EAST = 'DOWN_RIGHT',
  WEST = 'LEFT',
  EAST = 'RIGHT',
}
export const DIRECTIONS = [
  Direction.NORTH_WEST,
  Direction.NORTH_EAST,
  Direction.SOUTH_WEST,
  Direction.SOUTH_EAST,
  Direction.WEST,
  Direction.EAST,
];

/**
 * Hex Direction relative to the current facing
 * for a Mob/Player
 */
export enum RelativeDirection {
  FRONT = 'FRONT',
  FRONT_LEFT = 'FRONT_LEFT',
  FRONT_RIGHT = 'FRONT_RIGHT',

  BACK = 'BACK',
  BACK_LEFT = 'BACK_LEFT',
  BACK_RIGHT = 'BACK_RIGHT',
}
export const RELATIVE_DIRECTIONS = [
  RelativeDirection.FRONT,
  RelativeDirection.FRONT_LEFT,
  RelativeDirection.FRONT_RIGHT,

  RelativeDirection.BACK,
  RelativeDirection.BACK_LEFT,
  RelativeDirection.BACK_RIGHT,
];
export const GENERAL_RELATIVE_DIRECTIONS = {
  [RelativeDirection.FRONT]: [
    RelativeDirection.FRONT,
    RelativeDirection.FRONT_LEFT,
    RelativeDirection.FRONT_RIGHT,
  ],
  // TODO...
  // (only need front for now...)
  // : [
  //   RelativeDirection.BACK,
  //   RelativeDirection.BACK_LEFT,
  //   RelativeDirection.BACK_RIGHT,
  // ],
};


export type PointXY = [number, number];
export type PointXYZ = [number, number, number];


export function getHexGridDelta(currentY: number, direction: Direction): PointXY {
  switch (direction) {
    case Direction.NORTH_WEST:
      return [
        currentY % 2 === 0 ? 0 : -1,
        -1,
      ];
    case Direction.NORTH_EAST:
      return [
        currentY % 2 === 0 ? 1 : 0,
        -1,
      ];
    case Direction.SOUTH_WEST:
      return [
        currentY % 2 === 0 ? 0 : -1,
        1,
      ];
    case Direction.SOUTH_EAST:
      return [
        currentY % 2 === 0 ? 1 : 0,
        1,
      ];
    case Direction.WEST:
      return [
        -1,
        0,
      ];
    case Direction.EAST:
      return [
        1,
        0,
      ];
  }
}



const clockwiseDirectionOffsets = {
  [Direction.NORTH_WEST]: 0,
  [Direction.NORTH_EAST]: 1,
  [Direction.EAST]: 2,
  [Direction.SOUTH_EAST]: 3,
  [Direction.SOUTH_WEST]: 4,
  [Direction.WEST]: 5,
}

const clockwiseRelativeDirections = [
  RelativeDirection.FRONT,
  RelativeDirection.FRONT_RIGHT,
  RelativeDirection.BACK_RIGHT,
  RelativeDirection.BACK,
  RelativeDirection.BACK_LEFT,
  RelativeDirection.FRONT_LEFT,
];

const clockwiseCardinalDirections = [
  Direction.NORTH_WEST,
  Direction.NORTH_EAST,
  Direction.EAST,
  Direction.SOUTH_EAST,
  Direction.SOUTH_WEST,
  Direction.WEST,
];

/**
 * Given 2 directions,
 *    determine the relative direction,
 *
 * ex:
 *    null, EAST -> FRONT
 *    EAST, EAST -> FRONT
 *    EAST, WEST -> BACK
 */
export function getRelativeDirection(
  cardinalDirectionA: Direction | null,
  cardinalDirectionB: Direction,
): RelativeDirection {
  if (cardinalDirectionA === null) {
    // if no previous direction, then it's the front
    return RelativeDirection.FRONT;
  }

  const offsetA = clockwiseDirectionOffsets[cardinalDirectionA];
  const offsetB = clockwiseDirectionOffsets[cardinalDirectionB];

  const relativeIndex = (offsetB - offsetA + 6) % 6;

  return clockwiseRelativeDirections[relativeIndex];
}


/**
 *
 * Inverse of `getRelativeDirection`
 *  given a direction and a relative direction,
 * determine the resulting direction
 *
 * ex:
 *  EAST, FRONT -> EAST
 *  EAST, BACK -> WEST
 */
export function getCardinalDirectionFromRelativeDirection(
  cardinalDirection: Direction,
  relativeDirection: RelativeDirection,
): Direction {
  const offset = clockwiseDirectionOffsets[cardinalDirection];

  const relativeIndex = clockwiseRelativeDirections.indexOf(relativeDirection);

  const resultingOffset = (offset + relativeIndex) % 6;

  return clockwiseCardinalDirections[resultingOffset];
}

