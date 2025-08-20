import { Component, For, Show } from 'solid-js';
import { VedicChartProps } from '../../types';
import {
  calculateHouses,
  getPlanetDegree,
  getPlanetDisplay,
} from '../../utils';
import {
  formatAscendantDegree,
  getAscendantSign,
  getPlanetColor,
} from './utils/helpers';

type ChartProps = Omit<VedicChartProps, 'style'>;

const SouthIndianChart: Component<ChartProps> = (props) => {
  const houses = () =>
    calculateHouses(
      props.planets,
      props.ascendant,
      props.allowKetuOverride || false
    );

  const cellWidth = () => (props.width || 600) / 4;
  const cellHeight = () => (props.height || 600) / 4;

  // Calculate the ascendant sign number (1-12: Aries=1, Taurus=2, ..., Pisces=12)
  const ascendantSignNumber = () => Math.floor(props.ascendant / 30) + 1;

  // Helper function to get the sign number for each house
  const getHouseSignNumber = (houseNumber: number): number => {
    const signNumber = ((ascendantSignNumber() - 1 + houseNumber - 1) % 12) + 1;
    return signNumber;
  };

  // South Indian chart - 1st house at bottom-right, anti-clockwise progression
  const getHousePosition = (houseNum: number) => {
    const positions: { [key: number]: { row: number; col: number } } = {
      1: { row: 3, col: 3 }, // Bottom-right corner (1st house/Ascendant)
      2: { row: 3, col: 2 }, // Left adjacent to 1st house
      3: { row: 3, col: 1 }, // Continue left
      4: { row: 3, col: 0 }, // Bottom-left corner
      5: { row: 2, col: 0 }, // Left column, up from 4th
      6: { row: 1, col: 0 }, // Continue up left column
      7: { row: 0, col: 0 }, // Top-left corner
      8: { row: 0, col: 1 }, // Top row, right from 7th
      9: { row: 0, col: 2 }, // Continue right top row
      10: { row: 0, col: 3 }, // Top-right corner
      11: { row: 1, col: 3 }, // Right column, down from 10th
      12: { row: 2, col: 3 }, // Continue down right column, adjacent up from 1st
    };
    return positions[houseNum] || { row: 3, col: 3 };
  };

  const getCellCenter = (row: number, col: number) => ({
    x: col * cellWidth() + cellWidth() / 2,
    y: row * cellHeight() + cellHeight() / 2,
  });

  return (
    <svg
      width={props.width || 600}
      height={props.height || 600}
      viewBox={`0 0 ${props.width || 600} ${props.height || 600}`}
    >
      {/* Grid lines */}
      <g stroke="#666" stroke-width="1" fill="none">
        {/* Horizontal lines */}
        <For each={[0, 1, 2, 3, 4]}>
          {(i) => (
            <line
              x1={0}
              y1={i * cellHeight()}
              x2={props.width || 600}
              y2={i * cellHeight()}
            />
          )}
        </For>
        {/* Vertical lines */}
        <For each={[0, 1, 2, 3, 4]}>
          {(i) => (
            <line
              x1={i * cellWidth()}
              y1={0}
              x2={i * cellWidth()}
              y2={props.height || 600}
            />
          )}
        </For>
        {/* Diagonal lines for corner houses */}
        <line x1={0} y1={0} x2={cellWidth()} y2={cellHeight()} />{' '}
        {/* House 7 */}
        <line
          x1={3 * cellWidth()}
          y1={0}
          x2={4 * cellWidth()}
          y2={cellHeight()}
        />{' '}
        {/* House 10 */}
        <line
          x1={3 * cellWidth()}
          y1={3 * cellHeight()}
          x2={4 * cellWidth()}
          y2={4 * cellHeight()}
        />{' '}
        {/* House 1 */}
        <line
          x1={0}
          y1={3 * cellHeight()}
          x2={cellWidth()}
          y2={4 * cellHeight()}
        />{' '}
        {/* House 4 */}
      </g>

      {/* House content */}
      <For each={houses()}>
        {(house) => {
          const pos = getHousePosition(house.number);
          const center = getCellCenter(pos.row, pos.col);

          const isFirstHouse = house.number === 1;
          const totalItems = house.planets.length + (isFirstHouse ? 1 : 0);
          const itemSpacing = 18;

          return (
            <g>
              <Show when={props.showHouseLabels ?? true}>
                <text
                  x={center.x - cellWidth() * 0.3}
                  y={center.y - cellHeight() * 0.3}
                  font-size="12"
                  fill="#666"
                  font-weight="bold"
                >
                  {getHouseSignNumber(house.number)}
                </text>
              </Show>

              <For each={house.planets}>
                {(planetName, planetIndex) => {
                  const planetX = center.x;
                  const totalHeight = (totalItems - 1) * itemSpacing;
                  const startY = center.y - totalHeight / 2;

                  // Create a reactive computation for the Y position
                  const planetY = () => {
                    const adjustedIndex = isFirstHouse
                      ? planetIndex() + 1
                      : planetIndex();
                    return startY + adjustedIndex * itemSpacing;
                  };

                  return (
                    <text
                      x={planetX}
                      y={planetY()}
                      text-anchor="middle"
                      font-size="16"
                      fill={getPlanetColor(planetName)}
                    >
                      <tspan font-weight="bold">
                        {getPlanetDisplay(
                          planetName,
                          props.planetDisplayMode || 'symbols'
                        )}
                      </tspan>
                      <tspan font-weight="normal" fill="#666">
                        {' '}
                        {house.sign.substring(0, 3)}{' '}
                        {getPlanetDegree(
                          planetName,
                          props.planets,
                          props.allowKetuOverride || false
                        )}
                      </tspan>
                    </text>
                  );
                }}
              </For>
            </g>
          );
        }}
      </For>

      {/* Ascendant marker */}
      <Show
        when={(() => {
          const firstHouse = houses().find((h) => h.number === 1);
          return firstHouse;
        })()}
      >
        {(() => {
          const firstHouse = houses().find((h) => h.number === 1)!;
          const firstHousePos = getHousePosition(1);
          const firstHouseCenter = getCellCenter(
            firstHousePos.row,
            firstHousePos.col
          );

          const totalItems = firstHouse.planets.length + 1;
          const itemSpacing = 18;
          const totalHeight = (totalItems - 1) * itemSpacing;
          const startY = firstHouseCenter.y - totalHeight / 2;
          const ascendantY = startY;

          return (
            <text
              x={firstHouseCenter.x}
              y={ascendantY}
              text-anchor="middle"
              font-size="16"
              fill="black"
            >
              <tspan font-weight="bold">ASC</tspan>
              <tspan font-weight="normal" fill="#666">
                {' '}
                {getAscendantSign(props.ascendant)}{' '}
                {formatAscendantDegree(props.ascendant)}
              </tspan>
            </text>
          );
        })()}
      </Show>
    </svg>
  );
};

export default SouthIndianChart;
