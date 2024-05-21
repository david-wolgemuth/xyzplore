import { TILE_MAP } from './Tiles';


export const Cell = ({ keyPrefix, cellData, width, height }) => (
  <div
    key={keyPrefix}
    style={{
      width: `${width}vw`,
      height: `${height}vw`,
      backgroundColor: cellData.backgroundColor,
      color: cellData.textColor,
    }}
  >
    {/* {cellData.name} */}
  </div>
);

export const Row = ({ cells, rowType, widthFactor, heightFactor }) => (
  <div style={{ display: 'flex' }}>
    {cells.map((cell, x) => {
      const cellData = TILE_MAP[cell];
      if (x === 0 || x === cells.length - 1) {
        return (
          <>
            {x === 0 && <Cell keyPrefix={`${rowType}-pad${x}`} cellData={cellData} width={widthFactor / 2} height={heightFactor / 2} />}
            <Cell keyPrefix={`${rowType}${x}`} cellData={cellData} width={widthFactor} height={heightFactor / 2} />
            {x === cells.length - 1 && <Cell keyPrefix={`${rowType}-pad${x}`} cellData={cellData} width={widthFactor / 2} height={heightFactor / 2} />}
          </>
        );
      }
      return <Cell keyPrefix={`${rowType}${x}`} cellData={cellData} width={widthFactor} height={heightFactor / 2} />;
    })}
  </div>
);

export const Grid = ({ level, playerX, playerY, columnWest, columnEast }) => (
  <>
    {level.map((row, y) => (
      <div key={y} style={{ display: 'flex' }}>
        <Cell keyPrefix={`west${y}`} cellData={TILE_MAP[columnWest[y]]} width={100 / 26} height={100 / 13} />
        {row.map((cell, x) => {
          let key = cell;
          if (x === playerX && y === playerY) key = 'P';
          const cellData = TILE_MAP[key];
          return (
            <div
              key={`${x},${y}`}
              style={{
                width: `${100 / 13}vw`,
                height: `${100 / 13}vw`,
                fontSize: '1.5em',
                backgroundColor: 'black', //cellData.backgroundColor,
                color: cellData.backgroundColor,
              }}
            >
              {cellData.name[0]}
            </div>
          );
        })}
        <Cell keyPrefix={`east${y}`} cellData={TILE_MAP[columnEast[y]]} width={100 / 26} height={100 / 13} />
      </div>
    ))}
  </>
);
