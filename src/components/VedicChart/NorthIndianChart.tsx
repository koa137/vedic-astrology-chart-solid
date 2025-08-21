import { Component, For, Show } from 'solid-js';
import { VedicChartProps } from '../../types';
import {
  calculateHouses,
  getPlanetDegree,
  getPlanetDisplay,
} from '../../utils';
import { formatAscendantDegree, getAscendantSign } from './utils/helpers';
import '../../styles/vedic-chart.css';

type ChartProps = Omit<VedicChartProps, 'style'>;

const NorthIndianChart: Component<ChartProps> = (props) => {
  const houses = () =>
    calculateHouses(
      props.planets,
      props.ascendant,
      props.allowKetuOverride || false
    );

  const centerX = () => (props.width || 600) / 2;
  const centerY = () => (props.height || 600) / 2;
  const size = () => Math.min(props.width || 600, props.height || 600);

  // Calculate the ascendant sign number (1-12: Aries=1, Taurus=2, ..., Pisces=12)
  const ascendantSignNumber = () => Math.floor(props.ascendant / 30) + 1;

  // Helper function to get the sign number for each house
  const getHouseSignNumber = (houseNumber: number): number => {
    const signNumber = ((ascendantSignNumber() - 1 + houseNumber - 1) % 12) + 1;
    return signNumber;
  };

  // House number positions (scaled by 1.25)
  const houseNumberPositions = () => [
    // 1st house
    {
      num: 1,
      x: centerX(),
      y: centerY() - size() * 0.025, // was 0.02
      label: getHouseSignNumber(1).toString(),
    },
    // 2nd house
    {
      num: 2,
      x: centerX() - size() * 0.25, // was 0.2
      y: centerY() - size() * 0.275, // was 0.22
      label: getHouseSignNumber(2).toString(),
    },
    // 3rd house
    {
      num: 3,
      x: centerX() - size() * 0.2875, // was 0.23
      y: centerY() - size() * 0.24, // was 0.192
      label: getHouseSignNumber(3).toString(),
    },
    // 4th house
    {
      num: 4,
      x: centerX() - size() * 0.0375, // was 0.03
      y: centerY() + size() * 0.01, // was 0.008
      label: getHouseSignNumber(4).toString(),
    },
    // 5th house
    {
      num: 5,
      x: centerX() - size() * 0.2875, // was 0.23
      y: centerY() + size() * 0.2625, // was 0.21
      label: getHouseSignNumber(5).toString(),
    },
    // 6th house
    {
      num: 6,
      x: centerX() - size() * 0.25, // was 0.2
      y: centerY() + size() * 0.3, // was 0.24
      label: getHouseSignNumber(6).toString(),
    },
    // 7th house
    {
      num: 7,
      x: centerX(),
      y: centerY() + size() * 0.05, // was 0.04
      label: getHouseSignNumber(7).toString(),
    },
    // 8th house
    {
      num: 8,
      x: centerX() + size() * 0.25, // was 0.2
      y: centerY() + size() * 0.3, // was 0.24
      label: getHouseSignNumber(8).toString(),
    },
    // 9th house
    {
      num: 9,
      x: centerX() + size() * 0.2875, // was 0.23
      y: centerY() + size() * 0.2625, // was 0.21
      label: getHouseSignNumber(9).toString(),
    },
    // 10th house
    {
      num: 10,
      x: centerX() + size() * 0.0375, // was 0.03
      y: centerY() + size() * 0.01, // was 0.008
      label: getHouseSignNumber(10).toString(),
    },
    // 11th house
    {
      num: 11,
      x: centerX() + size() * 0.2875, // was 0.23
      y: centerY() - size() * 0.24, // was 0.192
      label: getHouseSignNumber(11).toString(),
    },
    // 12th house
    {
      num: 12,
      x: centerX() + size() * 0.25, // was 0.2
      y: centerY() - size() * 0.275, // was 0.22
      label: getHouseSignNumber(12).toString(),
    },
  ];

  // Planet centroid positions (scaled by 1.25)
  const planetCentroids = () => [
    // 1st house
    { num: 1, x: centerX(), y: centerY() - size() * 0.25 }, // was 0.2
    // 2nd house
    { num: 2, x: centerX() - size() * 0.25, y: centerY() - size() * 0.3875 }, // was 0.31
    // 3rd house
    { num: 3, x: centerX() - size() * 0.4, y: centerY() - size() * 0.24 }, // was 0.32, 0.192
    // 4th house
    { num: 4, x: centerX() - size() * 0.25, y: centerY() + size() * 0.01 }, // was 0.2, 0.008
    // 5th house
    { num: 5, x: centerX() - size() * 0.4, y: centerY() + size() * 0.2625 }, // was 0.32, 0.21
    // 6th house
    { num: 6, x: centerX() - size() * 0.25, y: centerY() + size() * 0.4 }, // was 0.2, 0.32
    // 7th house
    { num: 7, x: centerX(), y: centerY() + size() * 0.2625 }, // was 0.21
    // 8th house
    { num: 8, x: centerX() + size() * 0.25, y: centerY() + size() * 0.4 }, // was 0.2, 0.32
    // 9th house
    { num: 9, x: centerX() + size() * 0.4, y: centerY() + size() * 0.2625 }, // was 0.32, 0.21
    // 10th house
    { num: 10, x: centerX() + size() * 0.25, y: centerY() + size() * 0.01 }, // was 0.2, 0.008
    // 11th house
    { num: 11, x: centerX() + size() * 0.4, y: centerY() - size() * 0.24 }, // was 0.32, 0.192
    // 12th house
    { num: 12, x: centerX() + size() * 0.25, y: centerY() - size() * 0.3875 }, // was 0.2, 0.31
  ];

  return (
    <svg
      width={props.width || 600}
      height={props.height || 600}
      viewBox={`0 0 ${props.width || 600} ${props.height || 600}`}
      class="vedic-chart-svg"
    >
      {/* Outer square - now fills full space */}
      <rect
        x={centerX() - size() * 0.5}
        y={centerY() - size() * 0.5}
        width={size() * 1.0}
        height={size() * 1.0}
        fill="none"
        class="chart-border"
      />

      {/* House division lines */}
      <g class="chart-lines">
        {/* Outer diamond lines (4 corners to center) */}
        <g class="diamond-lines">
          <line
            x1={centerX() - size() * 0.5}
            y1={centerY()}
            x2={centerX()}
            y2={centerY() - size() * 0.5}
          />
          <line
            x1={centerX()}
            y1={centerY() - size() * 0.5}
            x2={centerX() + size() * 0.5}
            y2={centerY()}
          />
          <line
            x1={centerX() + size() * 0.5}
            y1={centerY()}
            x2={centerX()}
            y2={centerY() + size() * 0.5}
          />
          <line
            x1={centerX()}
            y1={centerY() + size() * 0.5}
            x2={centerX() - size() * 0.5}
            y2={centerY()}
          />
        </g>

        {/* Inner diamond lines (corner to corner diagonals) */}
        <g class="diagonal-lines">
          <line
            x1={centerX() - size() * 0.5}
            y1={centerY() - size() * 0.5}
            x2={centerX() + size() * 0.5}
            y2={centerY() + size() * 0.5}
          />
          <line
            x1={centerX() - size() * 0.5}
            y1={centerY() + size() * 0.5}
            x2={centerX() + size() * 0.5}
            y2={centerY() - size() * 0.5}
          />
        </g>
      </g>

      {/* House Numbers - scale proportionally */}
      <Show when={props.showHouseLabels ?? true}>
        <For each={houseNumberPositions()}>
          {({ x, y, label }) => (
            <text x={x} y={y} text-anchor="middle" class="house-label">
              {label}
            </text>
          )}
        </For>
      </Show>

      {/* Planets */}
      <For each={houses()}>
        {(house) => {
          const centroid = planetCentroids().find(
            (c) => c.num === house.number
          );

          return (
            <Show when={centroid && house.planets.length > 0}>
              <g>
                <For each={house.planets}>
                  {(planetName, planetIndex) => {
                    const planetX = centroid!.x;
                    const isFirstHouse = house.number === 1;
                    const totalItems =
                      house.planets.length + (isFirstHouse ? 1 : 0);
                    const itemSpacing = 18;
                    const totalHeight = (totalItems - 1) * itemSpacing;
                    const startY = centroid!.y - totalHeight / 2;

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
                        class={`planet-text planet-${planetName.toLowerCase()}`}
                      >
                        <tspan class="planet-symbol">
                          {getPlanetDisplay(
                            planetName,
                            props.planetDisplayMode || 'symbols'
                          )}
                        </tspan>
                        <tspan class="planet-details">
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
            </Show>
          );
        }}
      </For>

      {/* Ascendant marker */}
      <Show
        when={(() => {
          const firstHouse = houses().find((h) => h.number === 1);
          const firstHouseCentroid = planetCentroids().find((c) => c.num === 1);
          return firstHouse && firstHouseCentroid;
        })()}
      >
        {(() => {
          const firstHouse = houses().find((h) => h.number === 1)!;
          const firstHouseCentroid = planetCentroids().find(
            (c) => c.num === 1
          )!;
          const totalItems = firstHouse.planets.length + 1;
          const itemSpacing = 18;
          const totalHeight = (totalItems - 1) * itemSpacing;
          const startY = firstHouseCentroid.y - totalHeight / 2;
          const ascendantY = startY;

          return (
            <text
              x={firstHouseCentroid.x}
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

export default NorthIndianChart;
