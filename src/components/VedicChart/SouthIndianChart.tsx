import { Component, For, Show } from 'solid-js';
import { PlanetName, VedicChartProps } from '../../types';
import {
  calculateHouses,
  degreeToSign,
  getPlanetDegree,
  getPlanetDisplay,
  normalizePlanetaryPositions, // Add this import
} from '../../utils';
import { formatAscendantDegree, getAscendantSign } from './utils/helpers';
import { labelBlock, tagOffset, tagRise } from './utils/measure';
import '../../styles/vedic-chart.css';

type ChartProps = Omit<VedicChartProps, 'style'> & {
  showRetrograde?: boolean; // Add showRetrograde prop
};

const SouthIndianChart: Component<ChartProps> = (props) => {
  // Rows of labels in a house; a little roomier when superscript tags rise
  // above the details.
  const rowSpacing = () =>
    (props.tags && Object.keys(props.tags).length ? 21 : 18) *
    (props.rowSpacing ?? 1);
  const houses = () =>
    calculateHouses(
      props.planets,
      props.ascendant,
      props.allowKetuOverride || false,
      false,
      props.ascendant,
      props.placements
    );

  // A body's own sign, for its label: a placed body sits in another sign's
  // cell but keeps its own sign.
  const planetSign = (p: PlanetName): string => {
    const { positions } = normalizePlanetaryPositions(props.planets);
    const lon =
      p === 'Ketu' && !(props.allowKetuOverride || false)
        ? ((positions.Rahu ?? 0) + 180) % 360
        : (positions[p] ?? 0);
    return degreeToSign(lon);
  };

  // A body's label: its symbol, its details (sign and degree unless given),
  // and any tag above them.
  const symbolOf = (p: PlanetName) =>
    getPlanetDisplay(
      p,
      props.planetDisplayMode || 'symbols',
      props.planets,
      props.showRetrograde ?? true
    );
  const detailsOf = (p: PlanetName) =>
    props.details?.[p] !== undefined
      ? ` ${props.details[p]}`
      : ` ${planetSign(p).substring(0, 3)} ${getPlanetDegree(
          p,
          props.planets,
          props.allowKetuOverride || false,
          props.showRetrograde ?? true
        )}`;
  const tagOf = (p: string) => props.tags?.[p] ?? '';
  const ascDetails = () =>
    props.ascendantDetails !== undefined
      ? ` ${props.ascendantDetails}`
      : ` ${getAscendantSign(props.ascendant)} ${formatAscendantDegree(props.ascendant)}`;

  // A house's labels as one block centred in its cell (ASC included in the
  // 1st): the symbols in a column as wide as the widest, and every label's
  // details starting after it, so the degrees line up.
  const cellBlock = (house: { number: number; planets: string[] }) => {
    const pos = getHousePosition(house.number);
    const { column, width } = labelBlock([
      ...house.planets.map((p) => ({
        symbol: symbolOf(p as PlanetName),
        details: detailsOf(p as PlanetName),
        tag: tagOf(p),
      })),
      ...(house.number === 1 ? [{ symbol: 'ASC', details: ascDetails() }] : []),
    ]);
    const x = getCellCenter(pos.row, pos.col).x - width / 2;
    return { x, detailsX: x + column };
  };

  const cellWidth = () => (props.width || 600) / 4;
  const cellHeight = () => (props.height || 600) / 4;

  // Calculate the ascendant sign number (1-12: Aries=1, Taurus=2, ..., Pisces=12)
  const ascendantSignNumber = () => Math.floor(props.ascendant / 30) + 1;

  // Helper function to get the sign number for each house
  const getHouseSignNumber = (houseNumber: number): number => {
    const signNumber = ((ascendantSignNumber() - 1 + houseNumber - 1) % 12) + 1;
    return signNumber;
  };

  // South Indian chart: each sign has a fixed cell (Pisces top-left, the
  // signs running clockwise), and the houses follow the lagna's sign.
  const SIGN_CELLS: { row: number; col: number }[] = [
    { row: 0, col: 1 }, // Aries
    { row: 0, col: 2 }, // Taurus
    { row: 0, col: 3 }, // Gemini
    { row: 1, col: 3 }, // Cancer
    { row: 2, col: 3 }, // Leo
    { row: 3, col: 3 }, // Virgo
    { row: 3, col: 2 }, // Libra
    { row: 3, col: 1 }, // Scorpio
    { row: 3, col: 0 }, // Sagittarius
    { row: 2, col: 0 }, // Capricorn
    { row: 1, col: 0 }, // Aquarius
    { row: 0, col: 0 }, // Pisces
  ];
  const getHousePosition = (houseNum: number) =>
    SIGN_CELLS[getHouseSignNumber(houseNum) - 1];

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
          const itemSpacing = rowSpacing;
          const startY = () =>
            center().y - ((totalItems() - 1) * itemSpacing()) / 2;
          const markerY = () =>
            house().planets.length > 0 || isFirstHouse
              ? startY() - itemSpacing()
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
                  {num}
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
                    return startY() + adjustedIndex * itemSpacing();
                  };

                  const symbol = () => symbolOf(planetName as PlanetName);
                  const details = () => detailsOf(planetName as PlanetName);
                  const tag = () => tagOf(planetName);
                  // The cell's shared block (see cellBlock), laid out from its
                  // left edge so a tag can sit above the start of the details.
                  const startX = () => cellBlock(house()).x;
                  const detailsX = () => cellBlock(house()).detailsX;

                  return (
                    <text
                      x={startX()}
                      y={planetY()}
                      text-anchor="start"
                      class={[
                        'planet-text',
                        `planet-${planetName.toLowerCase()}`,
                        { retrograde: isRetrograde() },
                      ]}
                    >
                      <tspan class="planet-symbol">{symbol()}</tspan>
                      <Show when={tag()}>
                        <tspan
                          class="planet-tag"
                          x={detailsX() + tagOffset(details(), tag())}
                          dy={-tagRise()}
                        >
                          {tag()}
                        </tspan>
                      </Show>
                      <tspan
                        class="planet-details"
                        x={detailsX()}
                        dy={tag() ? tagRise() : undefined}
                      >
                        {details()}
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
          const itemSpacing = rowSpacing();
          const totalHeight = (totalItems - 1) * itemSpacing;
          const startY = firstHouseCenter.y - totalHeight / 2;
          const ascendantY = startY;
          // In line with the 1st house's planets (see cellBlock).
          const block = cellBlock(firstHouse);

          return (
            <text
              x={block.x}
              y={ascendantY}
              text-anchor="start"
              class="ascendant-text"
            >
              <tspan>ASC</tspan>
              <tspan class="planet-details" x={block.detailsX}>
                {ascDetails()}
              </tspan>
            </text>
          );
        })()}
      </Show>
    </svg>
  );
};

export default SouthIndianChart;
