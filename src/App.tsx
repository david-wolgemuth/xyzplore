import React from 'react';
import logo from './logo.svg';
import './App.css';


const WALL_TILE = {
  name: 'border',
  color: 'brown',
  key: 'x',
  impassable: true,
}

const EMPTY_TILE = {
  name: 'empty',
  color: 'black',
  key: '-',
}

const WATER_TILE = {
  name: 'water',
  color: 'blue',
  key: 'w',
  impassable: true,
}

const GRASS_TILE = {
  name: 'grass',
  color: 'green',
  key: 'g',
}

const ROCK_TILE = {
  name: 'rock',
  color: 'gray',
  key: 'r',
  impassable: true,
}

const PLAYER_TILE = {
  name: 'player',
  color: 'pink',
  key: 'P',
}

const NPC_TILE = {
  name: 'npc',
  color: 'orange',
  key: 'N',
  impassable: true,
}

const TREE_TILE = {
  name: 'tree',
  color: 'turquoise',
  key: 'T',
}

const HOUSE_TILE = {
  name: 'house',
  color: 'brown',
  key: 'H',
  impassable: true,
}

const DOWN_STAIRS_TILE = {
  name: 'down-stairs',
  color: 'yellow',
  key: 'd',
}

const UP_STAIRS_TILE = {
  name: 'up-stairs',
  color: 'yellow',
  key: 'u',
}

const TILES = [
  WALL_TILE,
  EMPTY_TILE,
  WATER_TILE,
  GRASS_TILE,
  ROCK_TILE,
  PLAYER_TILE,
  NPC_TILE,
  TREE_TILE,
  HOUSE_TILE,
  DOWN_STAIRS_TILE,
  UP_STAIRS_TILE,
]

const TILE_MAP = TILES.reduce((acc, tile) => {
  acc[tile.key] = tile;
  return acc;
}, {});


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

    const levelNorth = this.getLevel(x, y - 1, z);
    const levelSouth = this.getLevel(x, y + 1, z);
    const levelWest = this.getLevel(x - 1, y, z);
    const levelEast = this.getLevel(x + 1, y, z);

    this.setState({
      levelX: x,
      levelY: y,
      levelZ: z,
      level,

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
          dialog: 'Hello, traveler!',
        });
        break;
      case WALL_TILE.key:
      default:
        console.debug('impassable tile', tile.key);
        break;
    }
  }

  afterMove = () => {
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
      default:
        break;
    }
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

    return (
      <div className="App">
        <div style={{
          display: dialog ? 'block' : 'none',
          position: 'absolute',
          top: '10vh',
          left: '10vw',
          right: '10vw',
          padding: '1em',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid black',
          minHeight: '40vh',
        }}>
          {dialog}
        </div>
        <div style={{ display: 'flex' }}>
          {rowNorth.map((cell, x) => {
            const cellData = TILE_MAP[cell];
            if (x === 0) {
              // dupe, and make half width
              return (
                <>
                  <div
                    key={`north-pad${x}`}
                    style={{
                      width: `${100 / (2 * 13)}vw`,
                      height: `${100 / (2 * 13)}vw`,
                      backgroundColor: cellData.color,
                    }}
                  />
                  <div
                    key={`north${x}`}
                    style={{
                      width: `${100 / 13}vw`,
                      height: `${100 / (2 * 13)}vw`,
                      backgroundColor: cellData.color,
                    }}
                  >
                    {/* {cellData.name} */}
                  </div>
                </>
              )
            }
            if (x === rowNorth.length - 1) {
              // dupe, and make half width
              return (
                <>
                  <div
                    key={`north${x}`}
                    style={{
                      width: `${100 / 13}vw`,
                      height: `${100 / (2 * 13)}vw`,
                      backgroundColor: cellData.color,
                    }}
                  >
                    {/* {cellData.name} */}
                  </div>
                  <div
                    key={`north-padd${x}`}
                    style={{
                      width: `${100 / (2 * 13)}vw`,
                      height: `${100 / (2 * 13)}vw`,
                      backgroundColor: cellData.color,
                    }}
                  />
                </>
              )
            }
            return (
              <div
                key={`north${x}`}
                style={{
                  width: `${100 / 13}vw`,
                  height: `${100 / (2 * 13)}vw`,
                  backgroundColor: cellData.color,
                }}
              >
                {/* {cellData.name} */}
              </div>
            )
          })}
        </div>
        {level.map((row, y) => {
          return (
            <div key={y} style={{ display: 'flex' }}>
              {(() => {
                const cellData = TILE_MAP[columnWest[y]];
                return (
                  <div
                    style={{
                      width: `${100 / (2 * 13)}vw`,
                      height: `${100 / 13}vw`,
                      backgroundColor: cellData.color,
                    }}
                  >
                    {/* {cellData.name} */}
                  </div>
                )
              })()}
              {row.map((cell, x) => {
                let key = cell;
                if (x === playerX && y === playerY) {
                  key = 'P';
                }
                const cellData = TILE_MAP[key];

                return (
                  <div
                    key={`${x},${y}`}
                    style={{
                      // should be square - width of all tiles stretch to fit screen
                      width: `${100 / 13}vw`,  // Each tile takes up 1/12th of the viewport width
                      height: `${100 / 13}vw`, // Height is the same as the width to maintain a square

                      fontSize: '1.5em',

                      backgroundColor: cellData.color,
                    }}
                  >
                    {cellData.name}
                  </div>
                )
              })}
              {(() => {
                const cellData = TILE_MAP[columnEast[y]];
                return (
                  <div
                    style={{
                      width: `${100 / (2 * 13)}vw`,
                      height: `${100 / 13}vw`,
                      backgroundColor: cellData.color,
                    }}
                  >
                    {/* {cellData.name} */}
                  </div>
                )
              })()}
            </div>
          )
      })}
      <div
        style={{ display: 'flex' }}
      >
        {rowSouth.map((cell, x) => {
          const cellData = TILE_MAP[cell];
          if (x === 0) {
            // dupe, and make half width
            return (
              <>
                <div
                  key={`north${x}`}
                  style={{
                    width: `${100 / (2 * 13)}vw`,
                    height: `${100 / (2 * 13)}vw`,
                    backgroundColor: cellData.color,
                  }}
                />
                <div
                  key={`north-padd${x}`}
                  style={{
                    width: `${100 / 13}vw`,
                    height: `${100 / (2 * 13)}vw`,
                    backgroundColor: cellData.color,
                  }}
                >
                  {/* {cellData.name} */}
                </div>
              </>
            )
          }
          if (x === rowNorth.length - 1) {
            // dupe, and make half width
            return (
              <>
                <div
                  key={`north${x}`}
                  style={{
                    width: `${100 / 13}vw`,
                    height: `${100 / (2 * 13)}vw`,
                    backgroundColor: cellData.color,
                  }}
                >
                  {/* {cellData.name} */}
                </div>
                <div
                  key={`north-padd${x}`}
                  style={{
                    width: `${100 / (2 * 13)}vw`,
                    height: `${100 / (2 * 13)}vw`,
                    backgroundColor: cellData.color,
                  }}
                />
              </>
            )
          }
          return (
            <div
              key={`south${x}`}
              style={{
                width: `${100 / 13}vw`,
                height: `${100 / (2 * 13)}vw`,
                backgroundColor: cellData.color,
              }}
            >
              {/* {cellData.name} */}
            </div>
          )
        })}
      </div>
      </div>
    );
  }
}

export default App;
