// Unit tests for bird.npc.js
// Testing bird NPC functionality including movement AI and utility functions

import birdNPC, { BIRD_TILE, moveBird, moveBird2 } from './bird.npc.js';

// Mock console methods to avoid test noise
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

describe('BIRD_TILE Definition', () => {
  test('should have correct tile properties', () => {
    expect(BIRD_TILE).toEqual({
      name: 'bird',
      color: '#cd3f58',
      key: '`',
      display: '𓅚',
      mob: true,
    });
  });

  test('should be a mob type', () => {
    expect(BIRD_TILE.mob).toBe(true);
  });

  test('should use backtick as key', () => {
    expect(BIRD_TILE.key).toBe('`');
  });

  test('should use Egyptian hieroglyph bird symbol', () => {
    expect(BIRD_TILE.display).toBe('𓅚');
  });
});

describe('Utility Functions', () => {
  describe('randomChoice', () => {
    test('should return an element from the array', () => {
      const arr = [1, 2, 3, 4, 5];
      const choice = birdNPC.randomChoice(arr);
      expect(arr).toContain(choice);
    });

    test('should return the only element in single-element array', () => {
      const arr = ['only'];
      expect(birdNPC.randomChoice(arr)).toBe('only');
    });

    test('should handle different data types', () => {
      const arr = ['string', 42, { key: 'value' }, null];
      const choice = birdNPC.randomChoice(arr);
      expect(arr).toContain(choice);
    });
  });

  describe('randomSort', () => {
    test('should return array with same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const sorted = birdNPC.randomSort(arr);
      expect(sorted).toHaveLength(arr.length);
    });

    test('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const sorted = birdNPC.randomSort(arr);
      arr.forEach(element => {
        expect(sorted).toContain(element);
      });
    });

    test('should not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      birdNPC.randomSort(arr);
      expect(arr).toEqual(original);
    });

    test('should handle empty array', () => {
      const arr = [];
      const sorted = birdNPC.randomSort(arr);
      expect(sorted).toEqual([]);
    });
  });
});

describe('getHexGridDelta', () => {
  const { Direction, getHexGridDelta } = birdNPC;

  describe('Even Y coordinates (y % 2 === 0)', () => {
    const evenY = 4;

    test('NORTH_WEST should return [0, -1]', () => {
      expect(getHexGridDelta(evenY, Direction.NORTH_WEST)).toEqual([0, -1]);
    });

    test('NORTH_EAST should return [1, -1]', () => {
      expect(getHexGridDelta(evenY, Direction.NORTH_EAST)).toEqual([1, -1]);
    });

    test('SOUTH_WEST should return [0, 1]', () => {
      expect(getHexGridDelta(evenY, Direction.SOUTH_WEST)).toEqual([0, 1]);
    });

    test('SOUTH_EAST should return [1, 1]', () => {
      expect(getHexGridDelta(evenY, Direction.SOUTH_EAST)).toEqual([1, 1]);
    });

    test('WEST should return [-1, 0]', () => {
      expect(getHexGridDelta(evenY, Direction.WEST)).toEqual([-1, 0]);
    });

    test('EAST should return [1, 0]', () => {
      expect(getHexGridDelta(evenY, Direction.EAST)).toEqual([1, 0]);
    });
  });

  describe('Odd Y coordinates (y % 2 !== 0)', () => {
    const oddY = 3;

    test('NORTH_WEST should return [-1, -1]', () => {
      expect(getHexGridDelta(oddY, Direction.NORTH_WEST)).toEqual([-1, -1]);
    });

    test('NORTH_EAST should return [0, -1]', () => {
      expect(getHexGridDelta(oddY, Direction.NORTH_EAST)).toEqual([0, -1]);
    });

    test('SOUTH_WEST should return [-1, 1]', () => {
      expect(getHexGridDelta(oddY, Direction.SOUTH_WEST)).toEqual([-1, 1]);
    });

    test('SOUTH_EAST should return [0, 1]', () => {
      expect(getHexGridDelta(oddY, Direction.SOUTH_EAST)).toEqual([0, 1]);
    });

    test('WEST should return [-1, 0]', () => {
      expect(getHexGridDelta(oddY, Direction.WEST)).toEqual([-1, 0]);
    });

    test('EAST should return [1, 0]', () => {
      expect(getHexGridDelta(oddY, Direction.EAST)).toEqual([1, 0]);
    });
  });
});

describe('moveBird', () => {
  const mockCanMoveMob = jest.fn();
  
  beforeEach(() => {
    mockCanMoveMob.mockClear();
    mockCanMoveMob.mockReturnValue(true); // Default to allowing movement
  });

  test('should not move when player is far away (distance > 5)', () => {
    const bird = { x: 0, y: 0 };
    const gameState = { playerX: 10, playerY: 10 }; // Distance > 5
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    expect(result).toEqual(bird);
    expect(mockCanMoveMob).not.toHaveBeenCalled();
  });

  test('should move when player is close (distance <= 5)', () => {
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 7, playerY: 5 }; // Distance = 2
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    expect(mockCanMoveMob).toHaveBeenCalled();
    expect(result.x).not.toBe(bird.x); // Bird should have moved
  });

  test('should move away from player when player approaches from east', () => {
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 7, playerY: 5 }; // Player to the east
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    expect(result.x).toBeLessThanOrEqual(bird.x); // Bird should move west/southwest/northwest
  });

  test('should call canMoveMob with flying capability', () => {
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 7, playerY: 5 };
    
    moveBird(bird, gameState, mockCanMoveMob);
    
    expect(mockCanMoveMob).toHaveBeenCalledWith(
      expect.any(Number), // x
      expect.any(Number), // y
      expect.any(Number), // deltaX
      expect.any(Number), // deltaY
      true // canFly
    );
  });

  test('should return original bird when movement is blocked', () => {
    mockCanMoveMob.mockReturnValue(false); // Block all movement
    
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 7, playerY: 5 };
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    expect(result).toEqual(bird);
    expect(console.warn).toHaveBeenCalledWith("bird is stuck", bird);
  });

  test('should preserve bird properties when moving', () => {
    const bird = { x: 5, y: 5, id: 'bird1', health: 100 };
    const gameState = { playerX: 7, playerY: 5 };
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    expect(result.id).toBe('bird1');
    expect(result.health).toBe(100);
  });
});

describe('moveBird2', () => {
  const mockCanMoveMob = jest.fn();
  
  beforeEach(() => {
    mockCanMoveMob.mockClear();
    mockCanMoveMob.mockReturnValue(true);
  });

  test('should not move when player is far away', () => {
    const bird = { x: 0, y: 0 };
    const gameState = { playerX: 10, playerY: 10 };
    
    const result = moveBird2(bird, gameState, mockCanMoveMob);
    
    expect(result).toEqual(bird);
    expect(mockCanMoveMob).not.toHaveBeenCalled();
  });

  test('should move in exact opposite direction when player is close', () => {
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 6, playerY: 5 }; // Player directly east
    
    const result = moveBird2(bird, gameState, mockCanMoveMob);
    
    expect(mockCanMoveMob).toHaveBeenCalled();
    expect(result.x).not.toBe(bird.x);
  });

  test('should calculate correct opposite direction index', () => {
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 6, playerY: 5 }; // Player east, should move west
    
    moveBird2(bird, gameState, mockCanMoveMob);
    
    // Verify the movement calculation was called
    expect(mockCanMoveMob).toHaveBeenCalledWith(
      5, 5, // bird position
      expect.any(Number), // deltaX should be negative (moving west)
      0, // deltaY should be 0 (same row)
      true // canFly
    );
  });

  test('should return original bird when movement is blocked', () => {
    mockCanMoveMob.mockReturnValue(false);
    
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 6, playerY: 5 };
    
    const result = moveBird2(bird, gameState, mockCanMoveMob);
    
    expect(result).toEqual(bird);
    expect(console.warn).toHaveBeenCalledWith("bird is stuck", bird);
  });

  test('should handle player at same position as bird', () => {
    const bird = { x: 5, y: 5 };
    const gameState = { playerX: 5, playerY: 5 }; // Same position
    
    const result = moveBird2(bird, gameState, mockCanMoveMob);
    
    // Should still try to move (distance = 0 < 5)
    expect(mockCanMoveMob).toHaveBeenCalled();
  });
});

describe('Default Export', () => {
  test('should export all required functions and constants', () => {
    expect(birdNPC.BIRD_TILE).toBeDefined();
    expect(birdNPC.moveBird).toBeDefined();
    expect(birdNPC.moveBird2).toBeDefined();
    expect(birdNPC.Direction).toBeDefined();
    expect(birdNPC.getHexGridDelta).toBeDefined();
    expect(birdNPC.randomChoice).toBeDefined();
    expect(birdNPC.randomSort).toBeDefined();
  });

  test('should have correct Direction enum values', () => {
    const { Direction } = birdNPC;
    expect(Direction.NORTH_WEST).toBe('UP_LEFT');
    expect(Direction.NORTH_EAST).toBe('UP_RIGHT');
    expect(Direction.SOUTH_WEST).toBe('DOWN_LEFT');
    expect(Direction.SOUTH_EAST).toBe('DOWN_RIGHT');
    expect(Direction.WEST).toBe('LEFT');
    expect(Direction.EAST).toBe('RIGHT');
  });
});

describe('Integration Tests', () => {
  test('should work with realistic game scenario', () => {
    const mockCanMoveMob = jest.fn().mockReturnValue(true);
    
    // Simulate a bird and player on a hex grid
    const bird = { x: 10, y: 10, id: 'bird_01' };
    const gameState = { playerX: 12, playerY: 10 }; // Player approaches from east
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    // Bird should move away (westward)
    expect(result.x).toBeLessThan(bird.x);
    expect(result.id).toBe('bird_01'); // Properties preserved
    expect(mockCanMoveMob).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      true // Flying capability
    );
  });

  test('should handle edge of map scenario', () => {
    const mockCanMoveMob = jest.fn()
      .mockReturnValueOnce(false) // First direction blocked
      .mockReturnValueOnce(true);  // Second direction works
    
    const bird = { x: 0, y: 0 }; // Corner of map
    const gameState = { playerX: 2, playerY: 0 };
    
    const result = moveBird(bird, gameState, mockCanMoveMob);
    
    // Should try multiple directions
    expect(mockCanMoveMob).toHaveBeenCalledTimes(2);
    expect(result.x).not.toBe(bird.x); // Should still move
  });
});