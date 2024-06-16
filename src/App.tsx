import React from 'react';

import {
  TILE_MAP,
  EMPTY_TILE,
  BAT_TILE,
  WALL_TILE,
  NPC_TILE,
  FLOWER_TILE,
  DOWN_STAIRS_TILE,
  UP_STAIRS_TILE,
  PLAYER_TILE,
  SLIME_TILE,
  HOUSE_TILE,
  BIRD_TILE,
  WATER_TILE,
} from './Tiles';
import { Grid } from './Grid';
import { randomChoice, randomSort } from './utilities';
import { PointXY, PointXYZ, Direction, getHexGridDelta } from './directions';
import { getLightLevels } from './lighting';
import {
  INITIAL,
  EldraDialogText,
  EldraDialogGraph,
} from './NPCs';
// import { DRONE_CLOUD } from './Cards';


// if (window.bikesVDrones) {
//   console.log(DRONE_CLOUD);
// }


class App extends React.Component {
  // initial state to 0,0,0
  state = {
    levelX: 0,
    levelY: 0,
    levelZ: 0,
    level: null,

    levelNorth: null,
    levelSouth: null,
    levelWest: null,
    levelEast: null,

    inventory: {},
    npcs: [],
    mobs: [],
    previousMoves: [],

    playerX: 2,
    playerY: 2,

    currentNPC: null,
    dialogState: null,
    dialog: null,
    gameOver: false,
  }

  /** Safely get a level */
  getLevel = (x, y, z) => {
    try {
      const levelCSV = require(`./levels/${z}/${x},${y}.csv`);
      console.log('loaded level', x, y, z);
      return JSON.parse(levelCSV.split('module.exports = ')[1]);
    } catch (e) {
      console.log('no level', x, y, z);
      return null;
    }
  }

  /** Load level and set it to current level */
  loadLevel = (x, y, z, cb = null) => {
    const { npcs } = this.state;
    const levelCSV = require(`./levels/${z}/${x},${y}.csv`);
    const level = JSON.parse(levelCSV.split('module.exports = ')[1]);
    // mobs reset on each level
    const mobs = []

    for (let r = 0; r < level.length; r++) {
      for (let c = 0; c < level[r].length; c++) {
        if (!TILE_MAP[level[r][c]]) {
          console.error('invalid tile', level[r][c]);
          continue;
        }
        if (TILE_MAP[level[r][c]].npc) {
          if (npcs.find(npc => npc.tile === level[r][c])) {
            // npc already exists in npcs list
            continue;
          }
          npcs.push({
            x: c,
            y: r,
            levelX: x,
            levelY: y,
            levelZ: z,
            tile: level[r][c],
            state: {},
          });
          level[r][c] = EMPTY_TILE.key;
        } else if (TILE_MAP[level[r][c]].key === PLAYER_TILE.key) {
          level[r][c] = EMPTY_TILE.key;
        } else if (TILE_MAP[level[r][c]].mob) {
          mobs.push({
            x: c,
            y: r,
            tile: level[r][c],
            state: {},
          });
          level[r][c] = EMPTY_TILE.key;
        }
      }
    }

    const levelNorth = this.getLevel(x, y - 1, z);
    const levelSouth = this.getLevel(x, y + 1, z);
    const levelWest = this.getLevel(x - 1, y, z);
    const levelEast = this.getLevel(x + 1, y, z);

    this.setState({
      levelX: x,
      levelY: y,
      levelZ: z,
      level,
      npcs: npcs,
      mobs: mobs,

      levelNorth,
      levelSouth,
      levelWest,
      levelEast,
    }, cb);
  }

  tryMovePlayerDirection = (direction: Direction) => {
    const { playerX, playerY } = this.state;
    const [deltaX, deltaY] = getHexGridDelta(playerY, direction);
    const [newPlayerX, newPlayerY] = [playerX + deltaX, playerY + deltaY];

    // Simply move player within level
    // to new position
    if (this.canPlayerMoveWithinLevel(direction)) {

      this.setState({
        playerX: newPlayerX,
        playerY: newPlayerY,
      }, this.afterMove);
      return true;
    }

    // Trigger interaction with mob/npc
    if (this.canPlayerTriggerInteraction(direction)) {
      const newCell = this.getCells()[newPlayerY][newPlayerX];

      this.triggerPlayerInteractionWithTile(newCell.key, newPlayerX, newPlayerY);
      return false;
    }

    // Move to adjacent level
    const adjacentLevel = this.canPlayerMoveToAdjacentLevel(direction);
    if (adjacentLevel) {
      const [newLevelX, newLevelY, newLevelZ] = adjacentLevel.levelXYZ;
      const [newPlayerX, newPlayerY] = adjacentLevel.playerXY;
      this.loadLevel(newLevelX, newLevelY, newLevelZ);

      this.setState({
        playerX: newPlayerX,
        playerY: newPlayerY,
      });
      return true;
    }

    // assume impassable tile
    return false;
  }

  /**
   * check if the player can move within the current level
   *  without hitting an impassable tile or going to adjacent level
   */
  canPlayerMoveWithinLevel = (direction: Direction) => {
    const { playerX, playerY } = this.state;

    const [dx, dy] = getHexGridDelta(playerY, direction);

    const newPlayerX = playerX + dx;
    const newPlayerY = playerY + dy;

    if (newPlayerX < 0 || newPlayerX >= this.state.level[0].length ||
        newPlayerY < 0 || newPlayerY >= this.state.level.length) {
      // would attempt adjacent level
      return false;
    }

    const newCell = this.getCells()[newPlayerY][newPlayerX];
    if (newCell.impassable) {
      // TODO - handle fly?
      return false;
    }

    return true;
  };

  /**
   *
   * @param {Direction} direction
   * @returns Boolean - whether the player can trigger an interaction
   */
  canPlayerTriggerInteraction = (direction: Direction) => {
    const { playerX, playerY } = this.state;

    const [dx, dy] = getHexGridDelta(playerY, direction);

    const newPlayerX = playerX + dx;
    const newPlayerY = playerY + dy;

    if (newPlayerX < 0 || newPlayerX >= this.state.level[0].length ||
        newPlayerY < 0 || newPlayerY >= this.state.level.length) {
      // would attempt adjacent level
      return false;
    }

    const newCell = this.getCells()[newPlayerY][newPlayerX];

    return (
      newCell.mob
      || newCell.npc
      || newCell.key === HOUSE_TILE.key

      // for up/down; can "move player within level", then "after move" update level
      // || newCell.key === DOWN_STAIRS_TILE.key
      // || newCell.key === UP_STAIRS_TILE.key
    );
  }

  /**
   * @param {Direction} direction
   * @returns {Object} - whether the player can move to an adjacent level, the object containing x,y,z and newplayerX, newPlayerY
   */
  canPlayerMoveToAdjacentLevel = (direction: Direction): {
    playerXY: PointXY,
    levelXYZ: PointXYZ,
  } | null => {
    const {
      playerX,
      playerY,
      level,
      levelX,
      levelY,
      levelZ,
      levelNorth,
      levelSouth,
      levelWest,
      levelEast,
    } = this.state;

    const [deltaX, deltaY] = getHexGridDelta(playerY, direction);

    let newPlayerX = playerX + deltaX;
    let newPlayerY = playerY + deltaY;
    let newLevelX = levelX;
    let newLevelY = levelY;
    let newLevelZ = levelZ;
    let newLevel = null;

    if (newPlayerX < 0 && levelWest) {
      newLevel = levelWest;
      newLevelX = levelX - 1;
      newPlayerX = newLevel[0].length - 1;
    } else if (newPlayerX >= level[0].length && levelEast) {
      newLevel = levelEast;
      newLevelX = levelX + 1
      newPlayerX = 0;
    } else if (newPlayerY < 0 && levelNorth) {
      newLevel = levelNorth;
      newLevelY = levelY - 1;
      newPlayerY = newLevel.length - 1;
    } else if (newPlayerY >= level.length && levelSouth) {
      newLevel = levelSouth;
      newLevelY = levelY + 1;
      newPlayerY = 0;
    } else {
      return null;
    }

    // check new tile is passable
    try {
      const newTile = TILE_MAP[newLevel[newPlayerY][newPlayerX]];
      if (newTile.impassable) {
        return null;
      }
    } catch (e) {
      console.warn('no new tile', level, newPlayerX, newPlayerY);
      return null;
    }

    return {
      playerXY: [newPlayerX, newPlayerY],
      levelXYZ: [newLevelX, newLevelY, newLevelZ],
    }
  };

  // TODO rename to "trigger interaction"
  // and remove 'wall' / default
  triggerPlayerInteractionWithTile = (tileKey, tileX, tileY) => {
    const tile = TILE_MAP[tileKey];
    switch (tileKey) {
      case NPC_TILE.key:
        const npc = this.getNPCAtXY([tileX, tileY]);
        if (!npc) {
          console.error('no npc at', tileX, tileY);
          return;
        }
        // TODO - combine this dialog logic
        //  with dialog logic in handleRight
        //  (and move out of handleRight / handleHitImpassableTile ...)

        // only Eldra for now...
        const dialogState = npc.state.dialogState || INITIAL;
        this.setState({
          // dialog: //'Hello, traveler! This is what you have in your inventory: ' + JSON.stringify(this.state.inventory),
          currentNPC: npc,
          dialogState: dialogState,
          dialog: EldraDialogText[dialogState],
        });
        break;
      case HOUSE_TILE.key:
        console.log('house');
        this.setState({
          dialog: 'You entered a house, and rest.  Game saved',
        });
        this.saveGame();
        break;
      case SLIME_TILE.key:
      case BAT_TILE.key:
        this.setState({
          gameOver: true,
          dialog: 'You were eaten by a slime!  Game over',
        });
        break;
      default:
        console.warn('tile was not interactive', tile.key);
        break;
    }
  }

  getNPCAtXY = (pointXY: PointXY): any | null => {
    const {
      levelX,
      levelY,
      levelZ,
      npcs,
    } = this.state;

    const [tileX, tileY] = pointXY;

    return npcs.find(npc => (
        npc.x === tileX
        && npc.y === tileY
        && npc.levelX === levelX
        && npc.levelY === levelY
        && npc.levelZ === levelZ
    ));
  }

  moveMobs = (cb) => {
    const newMobs = this.state.mobs.map(mob => {
      switch (mob.tile) {
        case SLIME_TILE.key:
          return this.moveSlime(mob);
        case BAT_TILE.key:
          return this.moveBat(mob);
        case BIRD_TILE.key:
          return this.moveBird(mob);
        default:
          return mob;
      }
    });

    this.setState({
      mobs: newMobs,
    }, cb);
  }

  /**
   * moves in counter-clockwise direction,
   * based on previous direction
   *
   * returns new npc state
   */
  moveSlime = (slime, isRetry = false) => {
    const { x, y, prevDirection, clockwise } = slime;
    console.log('moving slime', slime);

    const directionsList = [
      Direction.UP_LEFT,
      Direction.LEFT,
      Direction.DOWN_LEFT,
      Direction.DOWN_RIGHT,
      Direction.RIGHT,
      Direction.UP_RIGHT,
    ];
    if (clockwise) {
      directionsList.reverse();
    }

    const tryMove = (dir) => {
      const [deltaX, deltaY] = getHexGridDelta(y, dir);
      if (this.canMoveMob(x, y, deltaX, deltaY)) {
        return {
          ...slime,
          x: slime.x + deltaX,
          y: slime.y + deltaY,
          prevDirection: dir,
        };
      }
      return null;
    };

    if (prevDirection) {
      while (directionsList[0] !== prevDirection) {
        directionsList.push(directionsList.shift());
      }
      directionsList.push(directionsList.shift());
    }

    for (const direction of directionsList) {
      const newSlime = tryMove(direction);
      if (newSlime) {
        return newSlime;
      }
    }

    console.warn('slime is stuck', slime);

    if (!isRetry) {
      return this.moveSlime({ ...slime, clockwise: !slime.clockwise }, true);
    }

    return slime;
  };


  /**
   * Moves in straight line,
   *  if blocked, moves in random direction
   */
  moveBat = (bat) => {
    const { x, y, direction } = bat;

    if (direction) {
      const [deltaX, deltaY] = getHexGridDelta(y, direction);
      if (this.canMoveMob(x, y, deltaX, deltaY, true)) {
        return {
          ...bat,
          x: bat.x + deltaX,
          y: bat.y + deltaY,
        };
      }
    }

    const directions = randomSort([
      Direction.UP_LEFT,
      Direction.LEFT,
      Direction.DOWN_LEFT,
      Direction.DOWN_RIGHT,
      Direction.RIGHT,
      Direction.UP_RIGHT,
    ]);

    for (const direction of directions) {
      const [deltaX, deltaY] = getHexGridDelta(y, direction);
      if (this.canMoveMob(x, y, deltaX, deltaY, true)) {
        return {
          ...bat,
          x: bat.x + deltaX,
          y: bat.y + deltaY,
          direction: direction,
        };
      }
    }
    console.warn("bat is stuck", bat);
    return bat;
  }

  /**
   * Stays still, unless player is close,
   * then moves in random direction away from player
   *
   * @param bird
   * @returns
   */
  moveBird = (bird) => {
    const { playerX, playerY } = this.state;
    const { x, y } = bird;

    // const directions = randomSort([
    //   Direction.UP_LEFT,
    //   Direction.LEFT,
    //   Direction.DOWN_LEFT,
    //   Direction.DOWN_RIGHT,
    //   Direction.RIGHT,
    //   Direction.UP_RIGHT,
    // ]);

    console.log('player', playerX, playerY, 'bird', x, y);

    const distanceToPlayer = Math.sqrt(
      Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2)
    );

    const directionToPlayer = Math.atan2(playerY - y, playerX - x);

    console.log(directionToPlayer);

    if (distanceToPlayer > 5) {
      return bird;
    }

    let oppositeDirections;
    if (directionToPlayer < Math.PI / 6) {
      console.log('down', directionToPlayer, Math.PI / 6);
      oppositeDirections = randomSort([
        Direction.DOWN_LEFT,
        Direction.DOWN_RIGHT,
      ]);
    } else if (directionToPlayer < Math.PI / 3) {
      console.log('left', directionToPlayer, Math.PI / 3);
      oppositeDirections = randomSort([
        Direction.LEFT,
        Direction.RIGHT,
      ]);
    } else if (directionToPlayer < Math.PI / 2) {
      console.log('up', directionToPlayer, Math.PI / 2);
      oppositeDirections = randomSort([
        Direction.UP_LEFT,
        Direction.UP_RIGHT,
      ]);
    } else if (directionToPlayer < Math.PI * 2 / 3) {
      console.log('up', directionToPlayer, Math.PI * 2 / 3);
      oppositeDirections = randomSort([
        Direction.LEFT,
        Direction.RIGHT,
      ]);
    } else if (directionToPlayer < Math.PI * 5 / 6) {
      console.log('up', directionToPlayer, Math.PI * 5 / 6);
      oppositeDirections = randomSort([
        Direction.DOWN_LEFT,
        Direction.DOWN_RIGHT,
      ]);
    } else {
      console.log('up', directionToPlayer, Math.PI);
      oppositeDirections = randomSort([
        Direction.UP_LEFT,
        Direction.UP_RIGHT,
      ]);
    }

    for (const direction of oppositeDirections) {
      const [deltaX, deltaY] = getHexGridDelta(y, direction);
      if (this.canMoveMob(x, y, deltaX, deltaY, true)) {
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

  /**
   * Stays still unless the player is close, then moves in the exact opposite direction away from the player.
   *
   * @param bird - The bird object containing its current x and y coordinates.
   * @returns Updated bird object with new coordinates if it moved.
   */
  moveBird2 = (bird) => {
    const { playerX, playerY } = this.state;
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
      Direction.RIGHT,
      Direction.UP_RIGHT,
      Direction.UP_LEFT,
      Direction.LEFT,
      Direction.DOWN_LEFT,
      Direction.DOWN_RIGHT
    ];

    // Calculate the index of the direction to move opposite to
    const index = Math.floor((directionToPlayer + Math.PI) / (Math.PI / 3)) % 6;
    const oppositeDirection = directions[index];

    // Calculate the delta for the bird's movement
    const [deltaX, deltaY] = getHexGridDelta(y, oppositeDirection);

    // Check if the bird can move to the new position
    if (this.canMoveMob(x, y, deltaX, deltaY, true)) {
      return {
        ...bird,
        x: bird.x + deltaX,
        y: bird.y + deltaY,
      };
    }

    console.warn("bird is stuck", bird);
    return bird;
  }

  /**
   * save game state
   * store all state in LocalStorage
   */
  saveGame = () => {
    const state = JSON.stringify(this.state);
    localStorage.setItem('gameState', state);
  }

  canMoveMob = (x, y, dx, dy, canFly = false) => {
    const { level } = this.state;
    if (!level[y + dy] || !level[y + dy][x + dx]) {
      // out of bounds
      return false;
    }
    const newTileKey = level[y + dy][x + dx];
    if (TILE_MAP[newTileKey].impassable) {
      if (canFly && TILE_MAP[newTileKey].key === WATER_TILE.key) {
        // can fly over water
        return true;
      }

      return false;
    }
    return true;
  }

  afterMove = () => {
    this.moveMobs(() => {
      const { playerX, playerY } = this.state;

      const tile = this.getCells()[this.state.playerY][this.state.playerX];
      // console.log('after move', tile);
      switch (tile.key) {
        case DOWN_STAIRS_TILE.key:
          this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ - 1);
          break;
        case UP_STAIRS_TILE.key:
          this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ + 1);
          break;
        case FLOWER_TILE.key:
          this.collectItem(tile.key, playerX, playerY);
          break;
        case SLIME_TILE.key:
        case BAT_TILE.key:
          this.setState({
            gameOver: true,
            dialog: `You were attacked by a ${tile.name}!  Game over`,
          });
          break;
        default:
          break;
      }
    });
  }

  collectItem = (tileKey, x, y) => {
    console.log('collecting item', tileKey, x, y);
    const { level, inventory } = this.state;
    level[y][x] = EMPTY_TILE.key;
    inventory[tileKey] = (inventory[tileKey] || 0) + 1;
    this.setState({ level, inventory });
  }

  componentDidMount(): void {
    document.addEventListener('keydown', this.onKeyPress);
    this.loadGame();
  }

  loadGame = () => {
    const state = localStorage.getItem('gameState');
    if (state) {
      this.setState(JSON.parse(state), () => {
        this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ);
      });
    } else {
      this.loadLevel(0, 0, 0);
    }
  }

  onKeyPress = (e) => {
    switch (e.key) {
      case 'h':
        this.handleLeft();
        break;
      case 'u':
        this.handleUpLeft();
        break;
      case 'i':
        this.handleUpRight();
        break;
      case 'k':
        this.handleRight();
        break;
      case 'm':
        this.handleDownRight();
        break;
      case 'n':
        this.handleDownLeft();
        break;
      default:
        break;
    }
  }

  handleUpLeft = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.tryMovePlayerDirection(Direction.UP_LEFT);
  }

  handleUpRight = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.tryMovePlayerDirection(Direction.UP_RIGHT);
  }

  handleDownLeft = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.tryMovePlayerDirection(Direction.DOWN_LEFT);
  }

  handleDownRight = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.tryMovePlayerDirection(Direction.DOWN_RIGHT);
  }

  handleLeft = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.tryMovePlayerDirection(Direction.LEFT);
  }

  handleRight = () => {
    const { dialog, gameOver, dialogState, currentNPC } = this.state;
    if (gameOver) {
      this.handleGameOver();
      return;
    }
    if (dialog) {
      if (dialogState) {
        const dialogGraphNode = EldraDialogGraph[dialogState];
        let newDialogState = dialogState;
        let newState = this.state;
        if (dialogGraphNode && dialogGraphNode.next) {
          [newDialogState, newState] = dialogGraphNode.next(
            this.state,
          );
        }

        // keep old state if no new state,
        // but dismiss dialog if no new dialog
        const dialogChanged = newDialogState !== dialogState;

        this.setState({
          ...newState,
          npcs: newState.npcs.map(npc => {
            if (npc.tile === currentNPC.tile) {
              return {
                ...npc,
                state: {
                  ...npc.state,
                  dialogState: newDialogState,
                },
              };
            }
            return npc;
          }),
          dialogState: dialogChanged ? newDialogState : null,
          dialog: dialogChanged ? EldraDialogText[newDialogState] : null,
        });
      } else {
        // this is just a system dialog, dismiss it
        this.setState({
          dialog: null
        });
      }
      return;
    }
    this.tryMovePlayerDirection(Direction.RIGHT);
  }


  /**
   * When game is over, reload the page,
   * will refresh the game state from last save
   */
  handleGameOver = () => {
    window.location.reload();
  }

  /**
   * layers npcs / mobs / player on top of level
   */
  getCells = (level = this.state.level) => {
    const cellsCopy = level.map(row => row.slice());

    const cellsData = cellsCopy.map((row, y) => {
      return row.map((cellKey, x) => {
        return {
          ...TILE_MAP[cellKey],
          x,
          y,
        };
      });
    })

    // set npcs & mobs
    // AFTER level is copied, so base can be set
    this.state.npcs.forEach(npc => {
      if (npc.levelX === this.state.levelX && npc.levelY === this.state.levelY) {
        const baseTile = cellsData[npc.y][npc.x];
        cellsData[npc.y][npc.x] = {
          ...TILE_MAP[npc.tile],
          base: baseTile,
        }
      }
    });
    this.state.mobs.forEach(mob => {
      // mobs do not have levelX/Y, they are always on current level
      const baseTile = cellsData[mob.y][mob.x];
      cellsData[mob.y][mob.x] = {
        ...TILE_MAP[mob.tile],
        base: baseTile,
      }
    });

    return cellsData;
  }

  getVisibleCells = () => {
    const {
      level,
      levelNorth,
      levelSouth,
      levelWest,
      levelEast,
      playerX,
      playerY,
      inventory,
    } = this.state;

    if (!level) {
      return null;
    }

    const cells = this.getCells();

    // set player
    const playerBase = cells[playerY][playerX];
    cells[playerY][playerX] = {
      ...PLAYER_TILE,
      base: playerBase,
    };
    if ((inventory as any).torch) {
      cells[playerY][playerX].lightLevel = 1.2;
    }

    const blockedRow = Array(cells[0].length).fill(WALL_TILE.key);

    const rowNorth = levelNorth ? levelNorth[levelNorth.length - 1] : blockedRow;
    const rowSouth = levelSouth ? levelSouth[0] : blockedRow;
    const columnWest = levelWest ? levelWest.map(row => row[row.length - 1]) : blockedRow;
    const columnEast = levelEast ? levelEast.map(row => row[0]) : blockedRow;

    const addData = (cellKey) => TILE_MAP[cellKey || EMPTY_TILE.key];

    const visibleCells = [
      // Top Row
      [
        ...columnWest[0],
        ...rowNorth,
        ...columnEast[0],
      ].map(addData),

      // Body
      ...cells.map((row, y) => {
        return [
          // Left Column Cell
          addData(columnWest[y]),
          ...row,
          // Right Column Cell
          addData(columnEast[y]),
        ];
      }),

      // Bottom Row
      [
        ...columnWest[columnWest.length - 1],
        ...rowSouth,
        ...columnEast[columnEast.length - 1],
      ].map(addData),
    ].map((row, y) => {
      return row.map((cell, x) => {
        return {
          ...cell,
          visibleX: x,
          visibleY: y,
        };
      });
    });

    const cellsWithLight = getLightLevels(visibleCells);

    return cellsWithLight;
  }

  render() {
    const {
      level,
      dialog,
      levelZ,
    } = this.state;

    if (!level) {
      return null;
    }

    const cells = this.getVisibleCells();

    return (
      <div
        className="App"
        style={{
          backgroundColor: '#1a1515',
          height: '100vh',
          width: '100vw',
        }}
      >
        <Dialog
          dialog={dialog}
        />
        <Grid
          cells={cells}
          z={levelZ}
        />
        <button onClick={() => this.saveGame()}>Save</button>
        <Debug>
          {{
            x: this.state.levelX,
            y: this.state.levelY,
            z: this.state.levelZ,
            dialog: this.state.dialog,
            dialogState: this.state.dialogState,
            inventory: this.state.inventory,
            npcs: this.state.npcs,
            mobs: this.state.mobs,
          }}
        </Debug>
        <MovementButtons
          onLeft={this.handleLeft}
          onRight={this.handleRight}
          onUpLeft={this.handleUpLeft}
          onUpRight={this.handleUpRight}
          onDownLeft={this.handleDownLeft}
          onDownRight={this.handleDownRight}
        />
      </div>
    );
  }
}

const Debug = ({ children }) => {
  return (
    <pre
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
      }}
    >
      {JSON.stringify(children, null, 2)}
    </pre>
  );
}

const Dialog = ({ dialog }) => (
  <div
    className="Dialog"
    style={{
      display: dialog ? 'block' : 'none',
      position: 'absolute',
      top: '10vh',
      left: '10vw',
      right: '10vw',
      padding: '1em',
      // background: 'rgba(73, 41, 1, 0.8)',
      background: 'var(--orange-primary)',
      border: '1px solid black',
      minHeight: '40vh',
      color: 'floralwhite',
      fontSize: '3em',
      zIndex: 10,
    }}
  >
    <h3 style={{
      marginTop: '-0.4em',
      background: 'var(--blue-primary)',
      color: 'var(--orange-primary)',
      padding: '1em',
    }}>
      Dialog
    </h3>
    <div style={{
      opacity: 1,
      color: 'black',
      fontWeight: 'bold',
      fontFamily: 'cursive',
    }}>
      {dialog}
    </div>
  </div>
);

const MovementButtons = ({ onLeft, onRight, onUpLeft, onUpRight, onDownLeft, onDownRight }) => {
  return (
    <div
      className="MovementButtons"
      style={{
        position: 'absolute',
        bottom: '10vh',
        // left: '10vw',
        right: '10vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '2em',
        opacity: 0.2,
        zIndex: 100,
        width: '8em',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button onClick={onUpLeft} style={{ fontSize: '2em', width: '40%' }}>u</button>
        <button onClick={onUpRight} style={{ fontSize: '2em', width: '40%' }}>i</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <button onClick={onLeft} style={{ fontSize: '2em', width: '40%' }}>h</button>
        <button onClick={onRight} style={{ fontSize: '2em', width: '40%' }}>k</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button onClick={onDownLeft} style={{ fontSize: '2em', width: '40%' }}>n</button>
        <button onClick={onDownRight} style={{ fontSize: '2em', width: '40%' }}>m</button>
      </div>
    </div>
  );
}


export default App;
