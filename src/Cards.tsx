
const TYPES = {
  UNIT: 'UNIT',
  MAIN: 'MAIN',
  TERRAIN: 'TERRAIN',
}

const DRONE_CLOUD = {
  key: 'DC',
  name: 'Drone Cloud',
  type: TYPES.UNIT,
}

const ENFORCER = {
  key: 'ES',
  name: 'Enforcer',
  type: TYPES.UNIT,
}

const SCOUT = {
  key: 'SC',
  name: 'Scout',
  type: TYPES.UNIT,
}

const AMR = {
  key: 'AM',
  name: 'AMR (Autonomous Mobile Robot)',
  type: TYPES.UNIT,
}

const BRYCE = {
  key: 'BR',
  name: 'Bryce',
  type: TYPES.MAIN,
}

const DUFF = {
  key: 'DU',
  name: 'Duff',
  type: TYPES.MAIN,
}

const MAINFRAME = {
  key: 'MF',
  name: 'Mainframe',
  type: TYPES.MAIN,
}

const LAMBDASAURUS = {
  key: 'LS',
  name: 'Lambdasaurus',
  type: TYPES.MAIN,
}

const NATURE_PRESERVE = {
  key: 'NP',
  name: 'Nature Preserve',
  type: TYPES.TERRAIN,
}


const initialState = {
  board: [],
  deck: [
    // forward, reverse

    // MAIN / CHARACTERS
    [BRYCE.key,         SCOUT.key],
    [ENFORCER.key, LAMBDASAURUS.key],  // (lambdasaurus is protected)
    [DUFF.key,          NATURE_PRESERVE.key],
    [AMR.key, MAINFRAME.key],  // (mainframe is protected)

    // AMRs take Enforcers
    // Scouts can walk past (swap) ??
    // Enforcers can walk past (swap) Scouts
    // Enforcers take Drones

    // DRONE CLOUDS
    [DRONE_CLOUD.key,   AMR.key],
    [DRONE_CLOUD.key,   AMR.key],
    [DRONE_CLOUD.key,   ENFORCER.key],
    [DRONE_CLOUD.key,   SCOUT.key],

    // SCOUTS
    [SCOUT.key,   DRONE_CLOUD.key],
    [SCOUT.key,   AMR.key],
    [SCOUT.key,   ENFORCER.key],
    [SCOUT.key,   NATURE_PRESERVE.key],

    // AMRS
    [AMR.key,   DRONE_CLOUD.key],
    [AMR.key,   DRONE_CLOUD.key],
    [AMR.key,   ENFORCER.key],
    [AMR.key,   SCOUT.key],

    // ENFORCERS
    [ENFORCER.key,   DRONE_CLOUD.key],
    [ENFORCER.key,   SCOUT.key],
    [ENFORCER.key,   AMR.key],
    [ENFORCER.key,   SCOUT.key],
  ],
  currentPlayer: 0,
};


const ACTIONS = {
  INITIALIZE: 'INITIALIZE',
  PLACE_TILE: 'PLACE_TILE',  // During Setup
  MOVE_TILE: 'MOVE_TILE',
}


function gameReducer(state = initialState, action) {
  switch (action.type) {
    case ACTIONS.INITIALIZE:
      return initialize(state);
    case ACTIONS.PLACE_TILE:
      return placeTile(state, action);
    default:
      throw 'Unhandled'
  };
}


const BOARD_SIZE = 8  // Rows, Columns
function initialize(state, rows=BOARD_SIZE, columns=BOARD_SIZE) {
  const board = [];
  for (let y = 0; y < rows; y += 1) {
    const row = [];
    for (let x = 0; x < columns; x += 1) {
      row.push(null);
    }
  }
  return {
    ...state,
    board,
  }
}


function placeTile(state, action) {

  const board = state.board.map((row, y) => {
    return row.map((card, x) => {
      if (action.x === x && action.y === y) {
        return action.card;
      } else {
        return card;
      }
    })
  })

  return {
    ...state,
    board,
  }
}
