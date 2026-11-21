import { Component, For, Show } from 'solid-js';
import { PlanetName, VedicChartProps } from '../../types';
import {
  calculateHouses,
  getPlanetDegree,
  getPlanetDisplay,
  normalizePlanetaryPositions, // Add this import
} from '../../utils';
import { formatAscendantDegree, getAscendantSign } from './utils/helpers';
import '../../styles/vedic-chart.css';

type ChartProps = Omit<VedicChartProps, 'style'> & {
  showRetrograde?: boolean; // Add showRetrograde prop
};

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

  // Custom markers ("words") placed by whole sign, grouped by house.
  const signOfLon = (lon: number) =>
    Math.floor((((lon % 360) + 360) % 360) / 30);
  const markerHouse = (lon: number) =>
    ((signOfLon(lon) - ascendantSignNumber() + 1 + 12) % 12) + 1;
  const markersInHouse = (houseNum: number) =>
    (props.customMarkers ?? []).filter(
      (m) => markerHouse(m.position) === houseNum
    );

  return (
    <svg
      width={props.width || 600}
      height={props.height || 600}
      viewBox={`0 0 ${props.width || 600} ${props.height || 600}`}
      class="vedic-chart-svg"
    >
      {/* Grid lines */}
      <g class="chart-lines">
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
      </g>

      {/* House content */}
      {/* Houses always arrive in order 1–12, so a row's index is its house:
          update each in place rather than rebuilding all twelve on a re-cast. */}
      <For each={houses()} keyed={false}>
        {(house, i) => {
          // With keyed={false} the index is a plain number (Solid 2), not the
          // accessor this Solid 1-era lint rule expects.
          // eslint-disable-next-line solid/reactivity
          const num = i + 1;
          // The callback body isn't a tracking scope: what reads reactive
          // state (the cell size, the markers) is an accessor.
          const pos = getHousePosition(num);
          const center = () => getCellCenter(pos.row, pos.col);

          const isFirstHouse = num === 1;
          const markers = () => markersInHouse(num);
          // Custom markers sit in a row above the planets (or at the cell centre
          // when empty) and don't disturb the planet stack.
          const totalItems = () =>
            house().planets.length + (isFirstHouse ? 1 : 0);
          const itemSpacing = 18;
          const startY = () =>
            center().y - ((totalItems() - 1) * itemSpacing) / 2;
          const markerY = () =>
            house().planets.length > 0 || isFirstHouse
              ? startY() - itemSpacing
              : center().y;

          return (
            <g>
              <Show when={props.showHouseLabels ?? true}>
                <text
                  x={center().x - cellWidth() * 0.3}
                  y={center().y - cellHeight() * 0.3}
                  text-anchor="middle"
                  class="house-label"
                >
                  {getHouseSignNumber(num)}
                </text>
              </Show>

              <For each={house().planets}>
                {(planetName, planetIndex) => {
                  // Retrograde info, read reactively.
                  const isRetrograde = () =>
                    !!normalizePlanetaryPositions(props.planets).retrogradeInfo[
                      planetName
                    ];

                  const planetY = () => {
                    const adjustedIndex = isFirstHouse
                      ? planetIndex() + 1
                      : planetIndex();
                    return startY() + adjustedIndex * itemSpacing;
                  };

                  return (
                    <text
                      x={center().x}
                      y={planetY()}
                      text-anchor="middle"
                      class={[
                        'planet-text',
                        `planet-${planetName.toLowerCase()}`,
                        { retrograde: isRetrograde() },
                      ]}
                    >
                      <tspan class="planet-symbol">
                        {getPlanetDisplay(
                          planetName as PlanetName,
                          props.planetDisplayMode || 'symbols',
                          props.planets,
                          props.showRetrograde ?? true
                        )}
                      </tspan>
                      <tspan class="planet-details">
                        {' '}
                        {house().sign.substring(0, 3)}{' '}
                        {getPlanetDegree(
                          planetName as PlanetName,
                          props.planets,
                          props.allowKetuOverride || false,
                          props.showRetrograde ?? true
                        )}
                      </tspan>
                    </text>
                  );
                }}
              </For>

              {/* Custom markers along the cell's bottom edge — a horizontal row
                  so several padas sit side by side, without disturbing planets. */}
              <For each={markers()}>
                {(m, mi) => (
                  <text
                    x={center().x + (mi() - (markers().length - 1) / 2) * 24}
                    y={markerY()}
                    text-anchor="middle"
                    class={['custom-marker-text', m.className]}
                  >
                    <tspan>{m.label}</tspan>
                    <Show when={m.details}>
                      <tspan class="planet-details"> {m.details}</tspan>
                    </Show>
                  </text>
                )}
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
              class="ascendant-text"
            >
              <tspan>ASC</tspan>
              <tspan class="planet-details">
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
