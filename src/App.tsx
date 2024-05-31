import React from 'react';
import './App.css';

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
} from './Tiles';
import { Grid } from './Grid';
import { randomChoice, randomSort } from './utilities';
import { PointXY, Direction, geHexGridDelta } from './directions';


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

    playerX: 2,
    playerY: 5,

    dialog: null,
    gameOver: false,
  }

  /** Safely get a level */
  getLevel = (x, y, z) => {
    try {
      const levelCSV = require(`./levels/${x},${y},${z}.csv`);
      console.log('loaded level', x, y, z);
      return JSON.parse(levelCSV.split('module.exports = ')[1]);
    } catch (e) {
      console.log('no level', x, y, z);
      return null;
    }
  }

  /** Load level and set it to current level */
  loadLevel = (x, y, z, cb = null) => {
    const levelCSV = require(`./levels/${x},${y},${z}.csv`);
    const level = JSON.parse(levelCSV.split('module.exports = ')[1]);
    const npcs = [];
    for (let y = 0; y < level.length; y++) {
      for (let x = 0; x < level[y].length; x++) {
        if (TILE_MAP[level[y][x]].npc) {
          npcs.push({
            x,
            y,
            tile: level[y][x],
            state: {},
          });
          level[y][x] = EMPTY_TILE.key;
        }
        if (TILE_MAP[level[y][x]].key === PLAYER_TILE.key) {
          level[y][x] = EMPTY_TILE.key;
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

      levelNorth,
      levelSouth,
      levelWest,
      levelEast,
    }, cb);
  }

  movePlayerDirection = (direction: Direction) => {
    const { playerY } = this.state;
    const { x: dx, y: dy } = geHexGridDelta(playerY, direction);
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
      const newTileKey = this.getFlattenedLevel()[newPlayerY][newPlayerX];

      if (TILE_MAP[newTileKey].impassable) {
        this.handleHitImpassableTile(newTileKey, newPlayerX, newPlayerY);
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
        this.setState({
          dialog: 'Hello, traveler! This is what you have in your inventory: ' + JSON.stringify(this.state.inventory),
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

  moveNPCs = (cb) => {
    const newNpcs = this.state.npcs.map(npc => {
      switch (npc.tile) {
        case SLIME_TILE.key:
          return this.moveSlime(npc);
        case BAT_TILE.key:
          return this.moveBat(npc);
        default:
          return npc;
      }
    });

    this.setState({
      npcs: newNpcs,
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
      const delta = geHexGridDelta(y, dir);
      if (this.canMoveNPC(x, y, delta.x, delta.y)) {
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
      const delta = geHexGridDelta(y, direction);
      if (this.canMoveNPC(x, y, delta.x, delta.y)) {
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
   * save game state
   * store all state in LocalStorage
   */
  saveGame = () => {
    const state = JSON.stringify(this.state);
    localStorage.setItem('gameState', state);
  }

  canMoveNPC = (x, y, dx, dy) => {
    const { level } = this.state;
    if (!level[y + dy] || !level[y + dy][x + dx]) {
      // out of bounds
      return false;
    }
    const newTileKey = level[y + dy][x + dx];
    if (TILE_MAP[newTileKey].impassable) {
      return false;
    }
    return true;
  }

  afterMove = () => {
    this.moveNPCs(() => {
      const { playerX, playerY } = this.state;

      const tileKey = this.getFlattenedLevel()[this.state.playerY][this.state.playerX];
      const tile = TILE_MAP[tileKey];
      console.debug('after move', { playerX, playerY, tileKey, tile });

      console.log('tileKey', tileKey);
      switch (tileKey) {
        case DOWN_STAIRS_TILE.key:
          this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ - 1);
          break;
        case UP_STAIRS_TILE.key:
          this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ + 1);
          break;
        case FLOWER_TILE.key:
          this.collectItem(tileKey, playerX, playerY);
          break;
        case SLIME_TILE.key:
        case BAT_TILE.key:
          this.setState({
            gameOver: true,
            dialog: `You were attacked by a ${TILE_MAP[tileKey].name}!  Game over`,
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
    const { dialog, gameOver } = this.state;
    if (gameOver) {
      this.handleGameOver();
      return;
    }
    if (dialog) {
      this.setState({ dialog: null });
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
   * layers npcs / player on top of level
   */
  getFlattenedLevel = (level = this.state.level) => {
    const newLevel = level.map(row => row.slice());
    // const { playerX, playerY } = this.state;
    // newLevel[playerY][playerX] = PLAYER_TILE.key;
    this.state.npcs.forEach(npc => {
      newLevel[npc.y][npc.x] = npc.tile;
    });
    return newLevel;
  }

  render() {
    const {
      level,
      playerX,
      playerY,

      levelNorth,
      levelSouth,
      levelWest,
      levelEast,

      dialog,
    } = this.state;

    if (!level) {
      return null;
    }
    const layeredLevel = this.getFlattenedLevel(level);

    const blockedRow = Array(layeredLevel[0].length).fill(WALL_TILE.key);

    const rowNorth = levelNorth ? levelNorth[levelNorth.length - 1] : blockedRow;
    const rowSouth = levelSouth ? levelSouth[0] : blockedRow;
    const columnWest = levelWest ? levelWest.map(row => row[row.length - 1]) : blockedRow;
    const columnEast = levelEast ? levelEast.map(row => row[0]) : blockedRow;

    const visibleCells = [
      [...columnWest[0], ...rowNorth, ...columnEast[0]],
      ...layeredLevel.map((row, y) => {
        return [
          columnWest[y],
          ...row,
          columnEast[y],
        ];
      }),
      [...columnWest[columnWest.length - 1], ...rowSouth, ...columnEast[columnEast.length - 1]],
    ];

    visibleCells[playerY + 1][playerX + 1] = PLAYER_TILE.key;

    for (let y = 0; y < visibleCells.length; y++) {
      for (let x = 0; x < visibleCells[y].length; x++) {
        if (!visibleCells[y][x]) {
          visibleCells[y][x] = EMPTY_TILE.key;
        }
      }
    }

    return (
      <div>
        <Dialog dialog={dialog} />
        <Grid
          cells={visibleCells}
        />
        <table>
          {[
            ["X", this.state.levelX],
            ["Y", this.state.levelY],
            ["Z", this.state.levelZ],
        ].map(([label, value]) => (
          <tr>
            <th>{label}</th>
            <td>{value}</td>
          </tr>
        ))}
        </table>
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


const Dialog = ({ dialog }) => (
  <div
    style={{
      display: dialog ? 'block' : 'none',
      position: 'absolute',
      top: '10vh',
      left: '10vw',
      right: '10vw',
      padding: '1em',
      background: 'rgba(73, 41, 1, 0.8)',
      border: '1px solid black',
      minHeight: '40vh',
      color: 'floralwhite',
      fontSize: '3em',
      zIndex: 10,
    }}
  >
    {dialog}
  </div>
);

const MovementButtons = ({ onLeft, onRight, onUpLeft, onUpRight, onDownLeft, onDownRight }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10vh',
        left: '10vw',
        right: '10vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '2em',
        opacity: 0.2,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <button onClick={onUpLeft} style={{ fontSize: '2em', width: '40%' }}>u</button>
        <button onClick={onUpRight} style={{ fontSize: '2em', width: '40%' }}>i</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '1em' }}>
        <button onClick={onLeft} style={{ fontSize: '2em', width: '40%' }}>h</button>
        <button onClick={onRight} style={{ fontSize: '2em', width: '40%' }}>k</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '1em' }}>
        <button onClick={onDownLeft} style={{ fontSize: '2em', width: '40%' }}>n</button>
        <button onClick={onDownRight} style={{ fontSize: '2em', width: '40%' }}>m</button>
      </div>
    </div>
  );
}


export default App;
