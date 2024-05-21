
export const WALL_TILE = {
  name: 'border',
  backgroundColor: 'brown',
  textColor: 'white',
  key: 'x',
  impassable: true,
}

export const EMPTY_TILE = {
  name: 'empty',
  backgroundColor: 'black',
  textColor: 'white',
  key: '-',
}

export const WATER_TILE = {
  name: 'water',
  backgroundColor: 'blue',
  textColor: 'white',
  key: 'w',
  impassable: true,
}

export const GRASS_TILE = {
  name: 'grass',
  backgroundColor: 'green',
  textColor: 'black',
  key: 'g',
}

export const ROCK_TILE = {
  name: 'rock',
  backgroundColor: 'gray',
  textColor: 'black',
  key: 'r',
  impassable: true,
}

export const PLAYER_TILE = {
  name: 'player',
  backgroundColor: 'pink',
  color: 'black',
  key: 'P',
}

export const NPC_TILE = {
  name: 'npc',
  backgroundColor: 'orange',
  color: 'black',
  key: 'N',
  impassable: true,
}

export const TREE_TILE = {
  name: 'tree',
  backgroundColor: 'turquoise',
  color: 'black',
  key: 'T',
}

export const HOUSE_TILE = {
  name: 'house',
  backgroundColor: 'brown',
  color: 'black',
  key: 'H',
  impassable: true,
}

export const DOWN_STAIRS_TILE = {
  name: 'down-stairs',
  backgroundColor: 'yellow',
  color: 'black',
  key: 'd',
}

export const UP_STAIRS_TILE = {
  name: 'up-stairs',
  backgroundColor: 'yellow',
  color: 'black',
  key: 'u',
}

export const TILES = [
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

export const TILE_MAP = TILES.reduce((acc, tile) => {
  acc[tile.key] = tile;
  return acc;
}, {});
