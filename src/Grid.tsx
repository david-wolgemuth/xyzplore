import { TILE_MAP } from './Tiles';


const TILES_PER_ROW = 12;
// assume square grid
const CELL_WIDTH = 100 / (TILES_PER_ROW + 1);
const CELL_HEIGHT = 100 / (TILES_PER_ROW + 1);


export function Cell({
  cellData,
  widthMultiplier = 1,
  heightMultiplier = 1,
}) {

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
      }}
    >
      {cellData.display || cellData.key}
    </div>
  );
}

export function Row({
  cells,
  heightMultiplier = 1,
}) {
  return (
    <div style={{
      display: 'flex',
      height: `${CELL_HEIGHT}vw`,
    }}>
      {cells.map((cell, x) => {
        const cellData = TILE_MAP[cell];

        return (
          <Cell
            key={x}
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
          width: `${CELL_WIDTH * (TILES_PER_ROW + 2)}vw`,
          height: `${CELL_HEIGHT * (TILES_PER_ROW + 2)}vh`,
          marginLeft: `-${CELL_WIDTH / 2}vw`,
          marginTop: `-${CELL_HEIGHT / 2}vw`,
        }}
      >
        {cells.map((row, y) => {
          return (
            <Row
              key={y}
              cells={row}
            />
          );
        })}
      </div>
    </div>
  );
}
