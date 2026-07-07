import {
  PlanetaryPositions,
  PlanetaryPositionsWithRetrograde,
} from './planets';

export type ChartStyle = 'north' | 'south';
export type PlanetDisplayMode = 'symbols' | 'names';

export interface VedicChartData {
  planets: PlanetaryPositions | PlanetaryPositionsWithRetrograde;
  ascendant: number; // degrees 0-360
  ayanamsa?: number; // degrees - optional since it's not used in calculations
}

export interface VedicChartProps extends VedicChartData {
  style?: ChartStyle;
  theme?: 'light' | 'dark' | 'custom' | string;
  width?: number;
  height?: number;
  showHouseLabels?: boolean;
  planetDisplayMode?: PlanetDisplayMode;
  allowKetuOverride?: boolean;
  showRetrograde?: boolean; // Add this new prop
  /** Right-click a planet or house to view the chart from it: called with the
   *  ecliptic longitude to use as the new ascendant (rotates the chart). */
  onSelectLagna?: (longitude: number) => void;
  /** Longitude to draw the "ASC" marker at. Defaults to `ascendant`. When the
   *  chart is rotated to view from another lagna, pass the real natal ascendant
   *  here so ASC stays at its actual position instead of moving to house 1. */
  lagnaMarker?: number;
  /** Draw the Bhava Chalit chart: place planets by equal house cusps (ascendant
   *  at the middle of the 1st bhava) instead of by whole sign. */
  bhavaChalit?: boolean;
}

export interface HouseInfo {
  number: number; // 1-12
  sign: string;
  planets: string[];
}
