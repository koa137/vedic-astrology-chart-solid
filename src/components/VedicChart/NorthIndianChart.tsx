import { Component, For, Show } from 'solid-js';
import { PlanetName, VedicChartProps } from '../../types';
import {
  calculateHouses,
  degreeToSign,
  getPlanetDegree,
  getPlanetDisplay,
  normalizePlanetaryPositions,
} from '../../utils';
import { formatAscendantDegree, getAscendantSign } from './utils/helpers';
import '../../styles/vedic-chart.css';

type ChartProps = Omit<VedicChartProps, 'style'> & {
  showRetrograde?: boolean;
};

// Measure rendered label widths (bold symbol + normal details) so a house can
// be centred on its widest label while every label shares one left start.
let measureCtx: CanvasRenderingContext2D | null | undefined;
function textWidth(text: string, font: string): number {
  if (measureCtx === undefined) {
    measureCtx =
      typeof document !== 'undefined'
        ? document.createElement('canvas').getContext('2d')
        : null;
  }
  if (!measureCtx) return text.length * 7; // SSR / no-canvas fallback
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}
// Must match .planet-text / .planet-details in vedic-chart.css.
const SYMBOL_FONT = 'bold 12px Arial, sans-serif';
const DETAILS_FONT = '10px Arial, sans-serif';
const labelWidth = (symbol: string, details: string): number =>
  textWidth(symbol, SYMBOL_FONT) + textWidth(details, DETAILS_FONT);

const NorthIndianChart: Component<ChartProps> = (props) => {
  const houses = () =>
    calculateHouses(
      props.planets,
      props.ascendant,
      props.allowKetuOverride || false,
      props.bhavaChalit || false,
      // Fix Bhava Chalit cusps to the natal ascendant so rotating the lagna
      // renumbers houses without moving planets between physical bhavas.
      props.lagnaMarker ?? props.ascendant
    );

  // A planet's own sidereal longitude (respecting the Ketu override) and its
  // sign — used for the label, since in Bhava Chalit a planet's sign differs
  // from the sign of the house it's drawn in.
  const planetLongitude = (p: PlanetName): number => {
    const { positions } = normalizePlanetaryPositions(props.planets);
    if (p === 'Ketu' && !(props.allowKetuOverride || false)) {
      return ((positions.Rahu ?? 0) + 180) % 360;
    }
    return positions[p] ?? 0;
  };
  const planetSign = (p: PlanetName): string =>
    degreeToSign(planetLongitude(p));

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

  // The point the "ASC" marker is drawn at (the real natal ascendant). Defaults
  // to `ascendant`, but when the chart is rotated to view from another lagna the
  // caller passes the natal ascendant here so ASC stays at its true position.
  const ascLongitude = () => props.lagnaMarker ?? props.ascendant;
  const signOfLon = (lon: number) =>
    Math.floor((((lon % 360) + 360) % 360) / 30);
  // Custom markers ("words") placed by whole sign, grouped by house.
  const markerHouse = (lon: number) =>
    ((signOfLon(lon) - signOfLon(props.ascendant) + 12) % 12) + 1;
  const markersInHouse = (houseNum: number) =>
    (props.customMarkers ?? []).filter(
      (m) => markerHouse(m.position) === houseNum
    );
  // Which house the ASC marker falls in given the current (possibly rotated)
  // house framing. 1 when not rotated.
  const ascHouseNumber = () =>
    ((signOfLon(ascLongitude()) - signOfLon(props.ascendant) + 12) % 12) + 1;

  const symbolOf = (p: PlanetName) =>
    getPlanetDisplay(
      p,
      props.planetDisplayMode || 'symbols',
      props.planets,
      props.showRetrograde ?? true
    );
  const detailsOf = (p: PlanetName) =>
    ` ${planetSign(p).substring(0, 3)} ${getPlanetDegree(
      p,
      props.planets,
      props.allowKetuOverride || false,
      props.showRetrograde ?? true
    )}`;

  // The common left start for every label in a house: centre the block on its
  // widest label (so a lone planet is centred and stacked planets line up),
  // clamped so labels can't run off either border.
  const labelStartX = (house: {
    number: number;
    sign: string;
    planets: string[];
  }): number => {
    const centroid = planetCentroids().find((c) => c.num === house.number);
    if (!centroid) return 0;
    let maxW = 0;
    for (const p of house.planets) {
      maxW = Math.max(
        maxW,
        labelWidth(symbolOf(p as PlanetName), detailsOf(p as PlanetName))
      );
    }
    if (house.number === ascHouseNumber()) {
      const details = ` ${getAscendantSign(ascLongitude())} ${formatAscendantDegree(
        ascLongitude()
      )}`;
      maxW = Math.max(maxW, labelWidth('ASC', details));
    }
    const sz = size();
    const pad = sz * 0.015;
    const left = centerX() - sz * 0.5 + pad;
    const right = centerX() + sz * 0.5 - pad;
    return Math.min(Math.max(centroid.x - maxW / 2, left), right - maxW);
  };

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
            <text
              x={x}
              y={y}
              text-anchor="middle"
              class="house-label"
              style={
                props.onSelectLagna ? { cursor: 'context-menu' } : undefined
              }
              onContextMenu={(e) => {
                if (!props.onSelectLagna) return;
                e.preventDefault();
                // Rotate so this sign (Aries=1 … Pisces=12) is the 1st house.
                // Keep the ascendant's degree-within-sign so a Bhava Chalit
                // chart's cusps (lagna ± 15°) stay intact rather than snapping
                // to sign boundaries; harmless in whole-sign framing.
                const degInSign = ((ascLongitude() % 30) + 30) % 30;
                props.onSelectLagna((parseInt(label, 10) - 1) * 30 + degInSign);
              }}
            >
              {label}
            </text>
          )}
        </For>
      </Show>

      {/* Planets */}
      <For each={houses()}>
        {(house) => {
          // The callback body isn't a tracking scope: everything that reads
          // reactive state is an accessor, read where it's used.
          const centroid = () =>
            planetCentroids().find((c) => c.num === house.number);
          // The house that holds the ASC marker reserves its top slot for ASC,
          // so its planets shift down one.
          const isAscHouse = () => house.number === ascHouseNumber();
          const markers = () => markersInHouse(house.number);
          const itemSpacing = 18;
          // Custom markers sit at the house periphery and don't disturb the
          // planet stack (planets + ASC only).
          const totalItems = () =>
            house.planets.length + (isAscHouse() ? 1 : 0);
          const startY = () =>
            (centroid()?.y ?? 0) - ((totalItems() - 1) * itemSpacing) / 2;
          // Custom markers: centred on the house, in a row just above the planet
          // stack (or at the house centre when the house holds no planets).
          const markerX = () => centroid()?.x ?? centerX();
          const markerRowY = () => {
            const hasContent = house.planets.length > 0 || isAscHouse();
            return hasContent
              ? startY() - itemSpacing
              : (centroid()?.y ?? centerY());
          };

          return (
            <Show
              when={
                centroid() && (house.planets.length > 0 || markers().length > 0)
              }
            >
              <g>
                <For each={house.planets}>
                  {(planetName, planetIndex) => {
                    // Retrograde info + absolute longitudes, read reactively.
                    const normalized = () =>
                      normalizePlanetaryPositions(props.planets);
                    const isRetrograde = () =>
                      !!normalized().retrogradeInfo[planetName];

                    // Every label in the house shares one left start (centred on
                    // the widest label, clamped to the borders).
                    const planetX = () => labelStartX(house);

                    const planetY = () => {
                      const adjustedIndex = isAscHouse()
                        ? planetIndex() + 1
                        : planetIndex();
                      return startY() + adjustedIndex * itemSpacing;
                    };

                    return (
                      <text
                        x={planetX()}
                        y={planetY()}
                        text-anchor="start"
                        style={
                          props.onSelectLagna
                            ? { cursor: 'context-menu' }
                            : undefined
                        }
                        onContextMenu={(e) => {
                          const lon =
                            normalized().positions[planetName as PlanetName];
                          if (!props.onSelectLagna || lon === undefined) return;
                          e.preventDefault();
                          // Rotate the chart to view it from this planet.
                          props.onSelectLagna(lon);
                        }}
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
                          {planetSign(planetName as PlanetName).substring(
                            0,
                            3
                          )}{' '}
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

                {/* Custom markers, centred above the planets — a horizontal row
                    so several padas in one house sit side by side. */}
                <For each={markers()}>
                  {(m, mi) => (
                    <text
                      x={markerX() + (mi() - (markers().length - 1) / 2) * 24}
                      y={markerRowY()}
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
            </Show>
          );
        }}
      </For>

      {/* Ascendant marker — drawn in the house the natal ascendant actually
          falls in (house 1 when the chart isn't rotated). */}
      <Show
        when={(() => {
          const ascHouse = houses().find((h) => h.number === ascHouseNumber());
          const ascCentroid = planetCentroids().find(
            (c) => c.num === ascHouseNumber()
          );
          return ascHouse && ascCentroid;
        })()}
      >
        {(() => {
          const ascHouse = houses().find((h) => h.number === ascHouseNumber())!;
          const ascCentroid = planetCentroids().find(
            (c) => c.num === ascHouseNumber()
          )!;
          // ASC takes the top slot; any planets in this house sit below it, so
          // count them for centring (matches the planet loop).
          const totalItems = ascHouse.planets.length + 1;
          const itemSpacing = 18;
          const totalHeight = (totalItems - 1) * itemSpacing;
          const ascendantY = ascCentroid.y - totalHeight / 2;
          // Share the house's common left start so ASC lines up with any planets.
          const ascendantX = labelStartX(ascHouse);

          return (
            <text
              x={ascendantX}
              y={ascendantY}
              text-anchor="start"
              class="ascendant-text"
            >
              <tspan>ASC</tspan>
              <tspan class="planet-details">
                {' '}
                {getAscendantSign(ascLongitude())}{' '}
                {formatAscendantDegree(ascLongitude())}
              </tspan>
            </text>
          );
        })()}
      </Show>
    </svg>
  );
};

export default NorthIndianChart;
