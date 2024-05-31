import { TILE_MAP } from './Tiles';


const TILES_PER_ROW = 12;
// assume square grid
const CELL_WIDTH = 100 / (TILES_PER_ROW + 1.5);
const CELL_HEIGHT = 100 / (TILES_PER_ROW + 0.5);


export function Cell({
  cellData,
  x,
  y,
  widthMultiplier = 1,
  heightMultiplier = 1,
}) {

  const isBorderCell = (
    x === 0
    || y === 0
    || x === TILES_PER_ROW + 1
    || y === TILES_PER_ROW + 1
  );

  return (
    <div
      className="cell"
      style={{
        position: 'relative',
        width: `${CELL_WIDTH}vw`,
        height: `${CELL_HEIGHT}vw`,
        color: cellData.color,
        textAlign: 'center',
        lineHeight: `${CELL_HEIGHT}vw`,
        fontSize: '6vw',
        backgroundColor: '#342929',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        opacity: isBorderCell ? 0.5 : 1,
      }}
    >
      {cellData.display || cellData.key}
    </div>
  );
}

export function Row({
  cells,
  y,
  heightMultiplier = 1,
}) {
  const offset = y % 2 === 0 ? 0 : CELL_WIDTH / 2;

  return (
    <div style={{
      display: 'flex',
      height: `${CELL_HEIGHT * 0.76}vw`,
      marginLeft: `${offset}vw`,
    }}>
      {cells.map((cell, x) => {
        const cellData = TILE_MAP[cell];

        return (
          <Cell
            key={x}
            x={x}
            y={y}
            cellData={cellData}
          />
        );
      })}
    </div>
  );
}

export function Grid ({
  cells,
}) {

  return (
    <div
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
          backgroundColor: 'black',
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
              cells={row}
            />
          );
        })}
      </div>
    </div>
  );
}
