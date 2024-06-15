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
import { PointXY, Direction, getHexGridDelta } from './directions';
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

  movePlayerDirection = (direction: Direction) => {
    const { playerY } = this.state;
    const { x: dx, y: dy } = getHexGridDelta(playerY, direction);
    this.movePlayerByDelta(dx, dy);
  }

  movePlayerByDelta = (dx, dy) => {
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

    let newLevel = null;
    let newLevelXYZ = [];
    let newPlayerX = playerX + dx;
    let newPlayerY = playerY + dy;

    // if off map, load level in that direction
    // move player to new position on the new level (if off east of map, then westmost position of new level)
    if (newPlayerX < 0) {
      newLevel = levelWest;
      if (!newLevel) {
        console.log('no level west');
        return false;
      }
      newPlayerX = newLevel[0].length - 1;
      newLevelXYZ = [levelX - 1, levelY, levelZ];
    }
    if (newPlayerX >= level[0].length) {
      newLevel = levelEast;
      if (!newLevel) {
        console.log('no level east');
        return false;
      }
      newPlayerX = 0;
      newLevelXYZ = [levelX + 1, levelY, levelZ];
    }
    if (newPlayerY < 0) {
      newLevel = levelNorth;
      if (!newLevel) {
        console.log('no level north');
        return false;
      }
      newPlayerY = newLevel.length - 1;
      newLevelXYZ = [levelX, levelY - 1, levelZ];
    }
    if (newPlayerY >= level.length) {
      newLevel = levelSouth;
      if (!newLevel) {
        console.log('no level south');
        return false;
      }
      newPlayerY = 0;
      newLevelXYZ = [levelX, levelY + 1, levelZ];
    }

    if (newLevel) {
      const newTile = TILE_MAP[newLevel[newPlayerY][newPlayerX]];
      if (newTile.impassable) {
        // do not handle impassable tiles when moving to new level,
        // instead, just don't move
        return false;
      }

      this.loadLevel(newLevelXYZ[0], newLevelXYZ[1], newLevelXYZ[2]);

      this.setState({
        playerX: newPlayerX,
        playerY: newPlayerY,
      }, this.afterMove);
      return true;

    } else {
      const newCell = this.getCells()[newPlayerY][newPlayerX];

      if (newCell.impassable) {
        this.handleHitImpassableTile(newCell.key, newPlayerX, newPlayerY);
        return false;
      }

      this.setState({
        playerX: newPlayerX,
        playerY: newPlayerY,
      }, this.afterMove);
      return true;
    }
  }

  handleHitImpassableTile = (tileKey, tileX, tileY) => {
    console.log('hit impassable tile', tileKey, tileX, tileY);
    const tile = TILE_MAP[tileKey];
    switch (tileKey) {
      case NPC_TILE.key:
        console.log('npc');
        const npc = this.state.npcs.find(
          npc => (
            npc.x === tileX
            && npc.y === tileY
            && npc.levelX === this.state.levelX
            && npc.levelY === this.state.levelY
            && npc.levelZ === this.state.levelZ
        ));
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
      case WALL_TILE.key:
      default:
        console.debug('impassable tile', tile.key);
        break;
    }
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
      const delta = getHexGridDelta(y, dir);
      if (this.canMoveMob(x, y, delta.x, delta.y)) {
        return {
          ...slime,
          x: slime.x + delta.x,
          y: slime.y + delta.y,
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
   * Moves in random direction
   */
  moveBat = (bat) => {
    const { x, y } = bat;

    const directions = randomSort([
      Direction.UP_LEFT,
      Direction.LEFT,
      Direction.DOWN_LEFT,
      Direction.DOWN_RIGHT,
      Direction.RIGHT,
      Direction.UP_RIGHT,
    ]);

    for (const direction of directions) {
      const delta = getHexGridDelta(y, direction);
      if (this.canMoveMob(x, y, delta.x, delta.y, true)) {
        return {
          ...bat,
          x: bat.x + delta.x,
          y: bat.y + delta.y,
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
      const delta = getHexGridDelta(y, direction);
      if (this.canMoveMob(x, y, delta.x, delta.y, true)) {
        return {
          ...bird,
          x: bird.x + delta.x,
          y: bird.y + delta.y,
        };
      }
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
    this.movePlayerDirection(Direction.UP_LEFT);
  }

  handleUpRight = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.movePlayerDirection(Direction.UP_RIGHT);
  }

  handleDownLeft = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.movePlayerDirection(Direction.DOWN_LEFT);
  }

  handleDownRight = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.movePlayerDirection(Direction.DOWN_RIGHT);
  }

  handleLeft = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    this.movePlayerDirection(Direction.LEFT);
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
    this.movePlayerDirection(Direction.RIGHT);
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
