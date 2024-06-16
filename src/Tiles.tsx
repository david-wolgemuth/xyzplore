
export const WALL_TILE = {
  name: 'wall',
  color: '#5c2803',
  background: '#40200c',
  key: 'x',
  display: '#',
  impassable: true,
  opacity: 1.6,
}

export const EMPTY_TILE = {
  name: 'empty',
  color: '#1e1c1c',
  key: '-',
}

export const WATER_TILE = {
  name: 'water',
  color: 'royalblue',
  key: 'w',
  display: '~',
  impassable: true,
}

export const GRASS_TILE = {
  name: 'grass',
  color: '#2c6d2c',
  key: 'g',
  display: 'ᆡ',
}

export const ROCK_TILE = {
  name: 'rock',
  color: 'gray',
  key: 'r',
  impassable: true,
}

export const PLAYER_TILE = {
  name: 'player',
  color: 'pink',
  key: 'P',
  display: '𓁆',
  bold: true,
  impassable: true,
  lightLevel: 0.4,
}

export const NPC_TILE = {
  name: 'npc',
  color: 'orange',
  key: 'N',
  display: '𓁘',
  bold: true,
  impassable: true,
  npc: true,
}

export const BIRD_TILE = {
  name: 'bird',
  color: '#cd3f58',
  key: '`',
  display: '𓅚',
  mob: true,
  // background: 'green',
}

export const FLOWER_TILE = {
  name: 'flower',
  color: '#cd3f58',
  key: 'f',
  display: '𓇗',
  // background: 'green',
}

export const TREE_TILE = {
  name: 'tree',
  color: '#00a307',
  key: 'T',
  display: '𐃐',
  impassable: true,
}

export const HOUSE_TILE = {
  name: 'house',
  color: 'brown',
  key: 'H',
  display: '𐂺',
  impassable: true,
}

export const DOWN_STAIRS_TILE = {
  name: 'down-stairs',
  color: '#e4d01e',
  key: 'd',
  display: '𐂪',
}

export const UP_STAIRS_TILE = {
  name: 'up-stairs',
  color: '#e4d01e',
  key: 'u',
  display: '𐂫',
}

export const SLIME_TILE = {
  name: 'slime',
  color: '#daa608',
  key: 's',
  display: '𓆧',
  bold: true,
  impassable: true,
  mob: true,
}


export const BAT_TILE = {
  name: 'bat',
  color: 'purple',
  key: 'b',
  display: '𓆤',
  bold: true,
  impassable: true,
  mob: true,
}


export const TORCH_TILE = {
  name: 'torch',
  color: 'yellow',
  key: 't',
  display: '𐂘',
  lightLevel: 1.2,
}


export const TILES = [
  WALL_TILE,
  EMPTY_TILE,
  WATER_TILE,
  GRASS_TILE,
  ROCK_TILE,
  PLAYER_TILE,
  BAT_TILE,
  NPC_TILE,
  SLIME_TILE,
  FLOWER_TILE,
  TREE_TILE,
  HOUSE_TILE,
  BIRD_TILE,
  DOWN_STAIRS_TILE,
  UP_STAIRS_TILE,
  TORCH_TILE,
]

export const TILE_MAP = TILES.reduce((acc, tile) => {
  acc[tile.key] = tile;
  return acc;
}, {});
