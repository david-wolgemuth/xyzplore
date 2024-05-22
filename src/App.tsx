import React from 'react';
import './App.css';

import {
  TILE_MAP,
  EMPTY_TILE,
  WALL_TILE,
  NPC_TILE,
  GRASS_TILE,
  DOWN_STAIRS_TILE,
  UP_STAIRS_TILE,
  PLAYER_TILE,
  SLIME_TILE,
} from './Tiles';
import { Grid } from './Grid';


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
    const npcs = level.reduce((acc, row, y) => {
      row.forEach((tile, x) => {
        if (TILE_MAP[tile].npc) {
          acc.push({
            x,
            y,
            tile,
            state: {},
          });
        }
      });
      return acc;
    }, []);

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

  movePlayer = (dx, dy) => {
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

    let newLevel = level;
    let newLevelXYZ = [];
    let newPlayerX = playerX + dx;
    let newPlayerY = playerY + dy;

    // if off map, load level in that direction
    // move player to new position on the new level (if off east of map, then westmost position of new level)
    if (newPlayerX < 0) {
      newLevel = levelWest;
      newPlayerX = newLevel[0].length - 1;
      newLevelXYZ = [levelX - 1, levelY, levelZ];
    }
    if (newPlayerX >= level[0].length) {
      newLevel = levelEast;
      newPlayerX = 0;
      newLevelXYZ = [levelX + 1, levelY, levelZ];
    }
    if (newPlayerY < 0) {
      newLevel = levelNorth;
      newPlayerY = newLevel.length - 1;
      newLevelXYZ = [levelX, levelY - 1, levelZ];
    }
    if (newPlayerY >= level.length) {
      newLevel = levelSouth;
      newPlayerY = 0;
      newLevelXYZ = [levelX, levelY + 1, levelZ];
    }

    if (!newLevel) {
      console.log('no level in that direction');
      return false;
    }

    const newTileKey = newLevel[newPlayerY][newPlayerX];
    if (TILE_MAP[newTileKey].impassable) {
      this.handleHitImpassableTile(newTileKey, newPlayerX, newPlayerY);
      return false;
    }

    if (level !== newLevel) {
      this.loadLevel(newLevelXYZ[0], newLevelXYZ[1], newLevelXYZ[2]);
    }

    this.setState({
      playerX: newPlayerX,
      playerY: newPlayerY,
    }, this.afterMove);
    return true;
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
      case SLIME_TILE.key:
        console.log('slime');
        this.setState({
          dialog: 'You encountered a slime!',
        });
        break;
      case WALL_TILE.key:
      default:
        console.debug('impassable tile', tile.key);
        break;
    }
  }

  moveNPCs = (cb) => {
    const level = this.state.level;
    const newNpcs = this.state.npcs.map(npc => {
      switch (npc.tile) {
        case SLIME_TILE.key:
          const newSlime = this.moveSlime(npc);
          if (npc.x !== newSlime.x || npc.y !== newSlime.y) {
            level[npc.y][npc.x] = EMPTY_TILE.key;
            level[newSlime.y][newSlime.x] = SLIME_TILE.key;
          }
          return newSlime;
        default:
          return npc;
      }
    });

    this.setState({
      npcs: newNpcs,
      level,
    }, cb);
  }

  /**
   * moves in counter-clockwise direction,
   * based on previous direction
   *
   * returns new npc state
   */
  moveSlime = (slime) => {
    const { x, y } = slime;
    switch (slime.prevDirection) {
      case '0,-1':
        if (this.canMoveNPC(x, y, -1, 0)) {
          return {
            ...slime,
            x: slime.x - 1,
            prevDirection: '-1,0',
          };
        }
        break;
      case '-1,0':
        if (this.canMoveNPC(x, y, 0, 1)) {
          return {
            ...slime,
            y: slime.y + 1,
            prevDirection: '0,1',
          };
        }
        break;
      case '0,1':
        if (this.canMoveNPC(x, y, 1, 0)) {
          return {
            ...slime,
            x: slime.x + 1,
            prevDirection:'1,0',
          };
        }
        break;
      case '1,0':
      default:
        if (this.canMoveNPC(x, y, 0, -1)) {
          return {
            ...slime,
            y: slime.y - 1,
            prevDirection: '0,-1',
          };
        }
        break;
    }
    console.warn('slime is stuck', slime);
    return slime;
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

      const tileKey = this.state.level[this.state.playerY][this.state.playerX];
      const tile = TILE_MAP[tileKey];
      console.debug('after move', { playerX, playerY, tileKey, tile });

      switch (tileKey) {
        case DOWN_STAIRS_TILE.key:
          this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ - 1);
          break;
        case UP_STAIRS_TILE.key:
          this.loadLevel(this.state.levelX, this.state.levelY, this.state.levelZ + 1);
          break;
        case GRASS_TILE.key:
          this.collectItem(tileKey, playerX, playerY);
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
    this.loadLevel(0, 0, 0);
  }

  onKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        this.handleLeft();
        break;
      case 'ArrowRight':
        this.handleRight();
        break;
      case 'ArrowUp':
        this.handleUp();
        break;
      case 'ArrowDown':
        this.handleDown();
        break;
      default:
        break;
    }
  }

  handleLeft = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    console.log('west');
    this.movePlayer(-1, 0);
  }

  handleRight = () => {
    const { dialog } = this.state;
    if (dialog) {
      this.setState({ dialog: null });
      return;
    }
    console.log('east');
    this.movePlayer(1, 0);
  }

  handleUp = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    console.log('north');
    this.movePlayer(0, -1);
  }

  handleDown = () => {
    const { dialog } = this.state;
    if (dialog) { return }
    console.log('south');
    this.movePlayer(0, 1);
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

    const blockedRow = Array(level[0].length).fill(WALL_TILE.key);

    const rowNorth = levelNorth ? levelNorth[levelNorth.length - 1] : blockedRow;
    const rowSouth = levelSouth ? levelSouth[0] : blockedRow;
    const columnWest = levelWest ? levelWest.map(row => row[row.length - 1]) : blockedRow;
    const columnEast = levelEast ? levelEast.map(row => row[0]) : blockedRow;

    const visibleCells = [
      [...columnWest[0], ...rowNorth, ...columnEast[0]],
      ...level.map((row, y) => {
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
      background: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid black',
      minHeight: '40vh',
    }}
  >
    {dialog}
  </div>
);


export default App;
