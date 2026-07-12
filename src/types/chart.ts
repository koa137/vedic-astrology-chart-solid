import {
  PlanetaryPositions,
  PlanetaryPositionsWithRetrograde,
} from './planets';

export type ChartStyle = 'north' | 'south';
export type PlanetDisplayMode = 'symbols' | 'names';

/** An arbitrary labelled point ("word") drawn on the wheel at a longitude,
 *  alongside the planets — e.g. arudha padas (A1…A12) or special lagnas. */
export interface CustomMarker {
  /** The text drawn (e.g. "A1", "UL", "AL"). */
  label: string;
  /** Ecliptic longitude 0–360; the marker is placed in this sign's house. */
  position: number;
  /** Optional secondary text after the label (e.g. a sign/degree). */
  details?: string;
  /** Optional extra CSS class for styling this marker. */
  className?: string;
}

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
  /** Extra labelled points to draw on the wheel (by whole sign), stacked under
   *  the planets in each house — e.g. arudha padas or special lagnas. */
  customMarkers?: CustomMarker[];
}

export interface HouseInfo {
  number: number; // 1-12
  sign: string;
  planets: string[];
}
