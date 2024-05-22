import { TILE_MAP } from './Tiles';


const TILES_PER_ROW = 12;  // assume square grid


export function Cell({
  cellData,
  widthMultiplier = 1,
  heightMultiplier = 1,
}) {
  const width = 100 / (TILES_PER_ROW + 1) * widthMultiplier;
  const height = 100 / (TILES_PER_ROW + 1) * heightMultiplier;

  return (
    <div
      style={{
        width: `${width}vw`,
        height: `${height}vw`,
        // backgroundColor: cellData.backgroundColor,
        // color: cellData.textColor,
        color: cellData.backgroundColor,
        backgroundColor: 'black',
        textAlign: 'center',
        lineHeight: `${height}vw`,
        outline: '1px solid gray',
        fontSize: '6vw',
      }}
    >
      {cellData.name[0]}
    </div>
  );
}

export function Row({
  cells,
  heightMultiplier = 1,
}) {
  return (
    <div style={{ display: 'flex' }}>
      {cells.map((cell, x) => {
        const cellData = TILE_MAP[cell];

        return (
          <Cell
            key={x}
            cellData={cellData}
            heightMultiplier={heightMultiplier}
            widthMultiplier={(x === 0 || x === cells.length - 1) ? 0.5 : 1}
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
    <>
      <Row cells={cells[0]} heightMultiplier={0.5} />
      {cells.slice(1, cells.length - 1).map((row, y) => {
        return (
          <Row
            key={y}
            cells={row}
          />
        );
      })}
      <Row cells={cells[cells.length - 1]} heightMultiplier={0.5} />
    </>
  );
}
