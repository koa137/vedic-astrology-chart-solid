export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto';

export interface PlanetaryPositions {
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
  Rahu: number;
  Ketu: number;
  // Optional outer planets
  Uranus?: number;
  Neptune?: number;
  Pluto?: number;
}

export interface PlanetInfo {
  name?: PlanetName;
  position: number; // degrees 0-360
  house?: number; // 1-12
  nakshatra?: string;
  isRetrograde?: boolean;
}

export interface PlanetaryPositionsWithRetrograde {
  Sun: number | PlanetInfo;
  Moon: number | PlanetInfo;
  Mars: number | PlanetInfo;
  Mercury: number | PlanetInfo;
  Jupiter: number | PlanetInfo;
  Venus: number | PlanetInfo;
  Saturn: number | PlanetInfo;
  Rahu: number | PlanetInfo;
  Ketu: number | PlanetInfo;
  Uranus?: number | PlanetInfo;
  Neptune?: number | PlanetInfo;
  Pluto?: number | PlanetInfo;
}
