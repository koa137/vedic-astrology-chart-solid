// Main component exports
export { default as VedicChart } from './components/VedicChart/VedicChart';
export { default as NorthIndianChart } from './components/VedicChart/NorthIndianChart';
export { default as SouthIndianChart } from './components/VedicChart/SouthIndianChart';
export { default as CircleChart } from './components/VedicChart/CircleChart';

// Type exports
export type {
  ChartStyle,
  PlanetDisplayMode,
  VedicChartData,
  VedicChartProps,
  HouseInfo,
  CustomMarker,
} from './types';

export type { PlanetaryPositions, PlanetName, PlanetInfo } from './types';

// Utility exports
export {
  calculateHouses,
  normalizePlanetaryPositions,
  getPlanetSymbol,
  getPlanetName,
  getPlanetDisplay,
  formatDegree,
  getPlanetDegree,
  degreeToSign,
  degreeToHouse,
  degreeToNakshatra,
  normalizeDegree,
  ZODIAC_SIGNS,
  NAKSHATRAS,
} from './utils';

// Sample data export
export { sampleChartData } from './data';

// CSS export - users can import this
export const defaultStyles = `
.vedic-chart {
  display: inline-block;
  font-family: Arial, sans-serif;
}

.vedic-chart svg {
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vedic-chart .house-label {
  font-size: calc(12px * var(--vedic-font-scale, 1));
  fill: #666666;
  font-weight: bold;
  user-select: none;
}

.vedic-chart .planet-text {
  font-size: calc(14px * var(--vedic-font-scale, 1));
  font-weight: bold;
  user-select: none;
}

.vedic-chart .planet-details {
  font-size: calc(12px * var(--vedic-font-scale, 1));
  font-weight: normal;
  fill: #666666;
}

.vedic-chart .planet-sun { fill: #FF0000; }
.vedic-chart .planet-moon { fill: #000000; }
.vedic-chart .planet-mars { fill: #CC0000; }
.vedic-chart .planet-mercury { fill: #008000; }
.vedic-chart .planet-jupiter { fill: #FF8C00; }
.vedic-chart .planet-venus { fill: #FF69B4; }
.vedic-chart .planet-saturn { fill: #4B0082; }
.vedic-chart .planet-rahu { fill: #800080; }
.vedic-chart .planet-ketu { fill: #8B4513; }

.vedic-chart .custom-marker-text {
  font-size: calc(9px * var(--vedic-font-scale, 1));
  font-weight: normal;
  fill: #888888;
  user-select: none;
}
`;
