// Bird NPC Implementation
// Copied and adapted from existing XYZxplore codebase

// Direction enum (copied from directions.tsx)
const Direction = {
  NORTH_WEST: 'UP_LEFT',
  NORTH_EAST: 'UP_RIGHT', 
  SOUTH_WEST: 'DOWN_LEFT',
  SOUTH_EAST: 'DOWN_RIGHT',
  WEST: 'LEFT',
  EAST: 'RIGHT',
};

// Bird tile definition (copied from Tiles.tsx:60-67)
export const BIRD_TILE = {
  name: 'bird',
  color: '#cd3f58',
  key: '`',
  display: '𓅚',
  mob: true,
  // background: 'green',
};

// Utility functions (copied from utilities.tsx)
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSort(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// Hex grid delta calculation (copied from directions.tsx)
function getHexGridDelta(currentY, direction) {
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

// Movement function (copied from App.tsx moveBird method)
/**
 * Bird movement AI - flees from player when they get too close
 * Calculates distance to player and moves in opposite direction
 * Can fly over water tiles
 * 
 * @param {Object} bird - Bird object with x, y coordinates
 * @param {Object} gameState - Game state containing playerX, playerY
 * @param {Function} canMoveMob - Function to check if movement is valid
 * @returns {Object} Updated bird object with new coordinates
 */
export function moveBird(bird, gameState, canMoveMob) {
  const { playerX, playerY } = gameState;
  const { x, y } = bird;
  
  console.log('player', playerX, playerY, 'bird', x, y);
  
  // Calculate distance to player
  const distanceToPlayer = Math.sqrt(
    Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
  );
  
  // Calculate direction from bird to player
  const directionToPlayer = Math.atan2(playerY - y, playerX - x);
  console.log(directionToPlayer);
  
  // Only move if player is within 5 units
  if (distanceToPlayer > 5) {
    return bird;
  }
  
  // Determine opposite directions based on angle to player
  let oppositeDirections;
  if (directionToPlayer < Math.PI / 6) {
    console.log('down', directionToPlayer, Math.PI / 6);
    oppositeDirections = randomSort([
      Direction.SOUTH_WEST,
      Direction.SOUTH_EAST,
    ]);
  } else if (directionToPlayer < Math.PI / 3) {
    console.log('left', directionToPlayer, Math.PI / 3);
    oppositeDirections = randomSort([
      Direction.WEST,
      Direction.EAST,
    ]);
  } else if (directionToPlayer < Math.PI / 2) {
    console.log('up', directionToPlayer, Math.PI / 2);
    oppositeDirections = randomSort([
      Direction.NORTH_WEST,
      Direction.NORTH_EAST,
    ]);
  } else if (directionToPlayer < Math.PI * 2 / 3) {
    console.log('up', directionToPlayer, Math.PI * 2 / 3);
    oppositeDirections = randomSort([
      Direction.WEST,
      Direction.EAST,
    ]);
  } else if (directionToPlayer < Math.PI * 5 / 6) {
    console.log('up', directionToPlayer, Math.PI * 5 / 6);
    oppositeDirections = randomSort([
      Direction.SOUTH_WEST,
      Direction.SOUTH_EAST,
    ]);
  } else {
    console.log('up', directionToPlayer, Math.PI);
    oppositeDirections = randomSort([
      Direction.NORTH_WEST,
      Direction.NORTH_EAST,
    ]);
  }
  
  // Try to move in opposite directions
  for (const direction of oppositeDirections) {
    const [deltaX, deltaY] = getHexGridDelta(y, direction);
    // Birds can fly over water
    const canFly = true;
    if (canMoveMob(x, y, deltaX, deltaY, canFly)) {
      return {
        ...bird,
        x: bird.x + deltaX,
        y: bird.y + deltaY,
      };
    }
  }
  
  console.warn("bird is stuck", bird);
  return bird;
}

// Alternative movement implementation (copied from App.tsx moveBird2 method)
/**
 * Alternative bird movement - moves in exact opposite direction
 * Stays still unless the player is close, then moves in the exact opposite direction away from the player.
 *
 * @param {Object} bird - The bird object containing its current x and y coordinates.
 * @param {Object} gameState - Game state containing playerX, playerY
 * @param {Function} canMoveMob - Function to check if movement is valid
 * @returns {Object} Updated bird object with new coordinates if it moved.
 */
export function moveBird2(bird, gameState, canMoveMob) {
  const { playerX, playerY } = gameState;
  const { x, y } = bird;
  
  console.log('player', playerX, playerY, 'bird', x, y);
  
  // Calculate the distance between the player and the bird
  const distanceToPlayer = Math.sqrt(
    Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
  );
  
  // Calculate the angle from the bird to the player
  const directionToPlayer = Math.atan2(playerY - y, playerX - x);
  console.log('directionToPlayer', directionToPlayer);
  
  // If the player is not within 5 units of distance, the bird stays still
  if (distanceToPlayer > 5) {
    return bird;
  }
  
  // Define the 6 primary directions in a hex grid
  const directions = [
    Direction.EAST,
    Direction.NORTH_EAST,
    Direction.NORTH_WEST,
    Direction.WEST,
    Direction.SOUTH_WEST,
    Direction.SOUTH_EAST
  ];
  
  // Calculate the index of the direction to move opposite to
  const index = Math.floor((directionToPlayer + Math.PI) / (Math.PI / 3)) % 6;
  const oppositeDirection = directions[index];
  
  // Calculate the delta for the bird's movement
  const [deltaX, deltaY] = getHexGridDelta(y, oppositeDirection);
  
  // Check if the bird can move to the new position
  if (canMoveMob(x, y, deltaX, deltaY, true)) {
    return {
      ...bird,
      x: bird.x + deltaX,
      y: bird.y + deltaY,
    };
  }
  
  console.warn("bird is stuck", bird);
  return bird;
}

// Export all bird-related functionality
export default {
  BIRD_TILE,
  moveBird,
  moveBird2,
  Direction,
  getHexGridDelta,
  randomChoice,
  randomSort,
};