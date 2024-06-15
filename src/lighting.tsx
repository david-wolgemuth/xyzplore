import { DIRECTIONS, getHexGridDelta } from './directions';
import { TORCH_TILE } from './Tiles';


const LIGHT_LOST_PER_TILE = 0.06;
const LIGHT_LOST_PER_IMPASSABLE_TILE = 0.4;


type LightSource = {
  x: number;
  y: number;
  lightLevel: number;
}


/**
 *
 * @param cells Array of arrays from the built level, prior to rendering
 */
export function getLightLevels(
  cells: any[][],
): number[][] {

  const numRows = cells.length;
  const numCols = cells[0].length;

  // make copy of cells / get light sources
  const lightSources = []
  const cellsWithLightLevels = cells.map((row, y) => {
    return row.map((cell, x) => {
      const lightLevel = Math.max(
        cell.lightLevel || 0.0,
        cell.base ? cell.base.lightLevel || 0.0 : 0.0,
        0.0,
      );
      if (lightLevel > 0) {
        lightSources.push({ x, y, lightLevel: lightLevel });
      }

      return {
        ...cell,
        lightLevel: lightLevel,
      };
    });
  });

  // Function to check if a point is within bounds and not an obstacle
  function inBounds(x: number, y: number): boolean {
    return x >= 0 && x < numCols && y >= 0 && y < numRows;
  }

  // BFS function to propagate light from a single source
  function addLightLevels(source: LightSource): void {
    const queue: LightSource[] = [source];

    const seen = {};

    while (queue.length > 0) {
      const { x, y, lightLevel } = queue.shift()!;
      // console.log('x, y, lightLevel', x, y, lightLevel);

      // only update the light level if it's higher than the current light level
      const cell = cellsWithLightLevels[y][x];
      if (cell.lightLevel < lightLevel) {
        cell.lightLevel = lightLevel;
      }

      if ((seen[`${x},${y}`] || 0) >= lightLevel) {
        continue;
      } else {
        seen[`${x},${y}`] = lightLevel;
      }

      if (lightLevel > 0) {
        for (const direction of DIRECTIONS) {
          const delta = getHexGridDelta(y, direction);
          const newX = x + delta.x;
          const newY = y + delta.y;

          if (!inBounds(newX, newY)) {
            continue;
          }

          const cell = cellsWithLightLevels[newY][newX];
          const lightLost = LIGHT_LOST_PER_TILE + (
            LIGHT_LOST_PER_TILE * (cell.opacity || 0) * 2
          );

          let newLightLevel = lightLevel - lightLost; // Decrease the light level as it propagates
          if (newLightLevel < 0) {
            newLightLevel = 0;
          }

          queue.push({
            x: newX,
            y: newY,
            lightLevel: newLightLevel,
          });
        }
      }
    }
  }

  // Process each light source
  for (const source of lightSources) {
    if (inBounds(source.x, source.y)) {
      addLightLevels(source);
    }
  }

  return cellsWithLightLevels;
}
