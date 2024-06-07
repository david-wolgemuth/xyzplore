import { TILE_MAP } from './Tiles';

const TILES_PER_ROW = 12;
// assume square grid
const CELL_WIDTH = 100 / (TILES_PER_ROW + 1.5);
const CELL_HEIGHT = 100 / (TILES_PER_ROW + 0.5);


export function Cell({
  cellData,
  x,
  y,
  z,
  widthMultiplier = 1,
  heightMultiplier = 1,
}) {

  const isBorderCell = (
    x === 0
    || y === 0
    || x === TILES_PER_ROW + 1
    || y === TILES_PER_ROW + 1
  );

  let backgroundColor = '#97D6A0';  // green / grassy
  backgroundColor = '#D6B8A4';  // dirt / sand

  if (z < 0) {
    backgroundColor = '#342929';
  }

  switch(cellData.key) {
    case 'w':// TILE_MAP.WATER_TILE.key:
      backgroundColor = '#6D8AA3'; // 'var(--blue-primary)';
      break;
    case 'g':
      backgroundColor = '#67B475'; // 'var(--green-related-2)';
      break;
    case 'T':
      backgroundColor = '#1B6D36'; //'var(--green-related-1)';
      break;
    default:
      break;
  }

  return (
    <div
      className="Cell"
      style={{
        position: 'relative',
        width: `${CELL_WIDTH}vw`,
        height: `${CELL_HEIGHT}vw`,
        color: cellData.color,
        textAlign: 'center',
        lineHeight: `${CELL_HEIGHT}vw`,
        // fontSize: '6vw',
        fontSize: '3vw',
        backgroundColor: backgroundColor,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',

        // TODO - Light Levels / Shading
        // opacity: cellData.lightLevel,
      }}
    >
      {cellData.display || cellData.key}
      {/* {cellData.lightLevel} */}
    </div>
  );
}

export function Row({
  cells,
  y,
  z,
  heightMultiplier = 1,
}) {
  const offset = y % 2 === 0 ? 0 : CELL_WIDTH / 2;

  return (
    <div
      className="Row"
      style={{
        display: 'flex',
        height: `${CELL_HEIGHT * 0.76}vw`,
        marginLeft: `${offset}vw`,
      }}
    >
      {cells.map((cell, x) => {

        return (
          <Cell
            key={x}
            x={x}
            y={y}
            z={z}
            cellData={cell}
          />
        );
      })}
    </div>
  );
}

export function Grid ({
  cells,
  z,
}) {

  return (
    <div
      className="Grid"
      style={{
        overflow: 'hidden',
        width: '100vw',
        height: `${CELL_HEIGHT * (cells.length - 1)}vw`,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          // backgroundColor: 'black',
          flexDirection: 'column',
          width: `${CELL_WIDTH * (TILES_PER_ROW + 3)}vw`,
          height: `${CELL_HEIGHT * (TILES_PER_ROW + 2)}vh`,
          marginLeft: `-${CELL_WIDTH / 2}vw`,
          marginTop: `-${CELL_HEIGHT / 2}vw`,
        }}
      >
        {cells.map((row, y) => {
          return (
            <Row
              key={y}
              y={y}
              z={z}
              cells={row}
            />
          );
        })}
      </div>
    </div>
  );
}
