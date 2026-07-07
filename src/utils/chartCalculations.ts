import {
  HouseInfo,
  PlanetaryPositions,
  PlanetaryPositionsWithRetrograde,
  PlanetDisplayMode,
  PlanetName,
} from '../types';
import { degreeToSign, normalizeDegree } from './astroUtils';

export const normalizePlanetaryPositions = (
  planets: PlanetaryPositions | PlanetaryPositionsWithRetrograde
): {
  positions: PlanetaryPositions;
  retrogradeInfo: Record<string, boolean>;
} => {
  const positions: PlanetaryPositions = {} as PlanetaryPositions;
  const retrogradeInfo: Record<string, boolean> = {};

  Object.entries(planets).forEach(([planetName, data]) => {
    if (typeof data === 'number') {
      positions[planetName as PlanetName] = data;
      retrogradeInfo[planetName] = false;
    } else {
      positions[planetName as PlanetName] = data.position;
      retrogradeInfo[planetName] = data.isRetrograde || false;
    }
  });

  return { positions, retrogradeInfo };
};

export function calculateHouses(
  planets: PlanetaryPositions | PlanetaryPositionsWithRetrograde,
  ascendant: number,
  allowKetuOverride: boolean = false,
  bhavaChalit: boolean = false
): HouseInfo[] {
  // Normalize planetary positions first
  const { positions: normalizedPlanets } = normalizePlanetaryPositions(planets);

  const houses: HouseInfo[] = [];

  // Whole sign system: each house is exactly 30 degrees starting from ascendant sign
  const ascendantSignStart = Math.floor(ascendant / 30) * 30;

  // Initialize all 12 houses using whole sign system
  for (let i = 1; i <= 12; i++) {
    const houseSignStart = normalizeDegree(ascendantSignStart + (i - 1) * 30);
    houses.push({
      number: i,
      sign: degreeToSign(houseSignStart),
      planets: [],
    });
  }

  // Place planets in houses using whole sign system
  Object.entries(normalizedPlanets).forEach(([planetName, degree]) => {
    // Skip undefined planets (optional outer planets)
    if (degree === undefined) return;

    let planetDegree = degree;

    // Handle Ketu override logic
    if (planetName === 'Ketu' && !allowKetuOverride) {
      planetDegree = normalizeDegree(normalizedPlanets.Rahu + 180);
    }

    let houseNumber: number;
    if (bhavaChalit) {
      // Bhava Chalit (equal, longitude-only): the ascendant sits at the middle
      // of the 1st bhava, so cusps fall at lagna ± 15°, ± 45°, … A planet's
      // bhava is the 30° segment centred on each house cusp. Works for any
      // chart (D1 or a divisional) since it needs only the ascendant longitude.
      const offset = normalizeDegree(planetDegree - ascendant);
      houseNumber = (Math.floor((offset + 15) / 30) % 12) + 1;
    } else {
      // Whole-sign: the planet's house is its sign counted from the lagna sign.
      const planetSignStart = Math.floor(planetDegree / 30) * 30;
      const ascendantSignIndex = Math.floor(ascendantSignStart / 30);
      const planetSignIndex = Math.floor(planetSignStart / 30);
      houseNumber = ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;
    }

    const house = houses.find((h) => h.number === houseNumber);
    if (house) {
      house.planets.push(planetName as PlanetName);
    }
  });

  return houses;
}

export function getPlanetSymbol(planetName: string): string {
  const symbols: { [key: string]: string } = {
    Sun: '☉',
    Moon: '☽',
    Mars: '♂',
    Mercury: '☿',
    Jupiter: '♃',
    Venus: '♀',
    Saturn: '♄',
    Rahu: '☊',
    Ketu: '☋',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
  };
  return symbols[planetName] || planetName.substring(0, 1);
}

export function getPlanetName(planetName: string): string {
  const names: { [key: string]: string } = {
    Sun: 'Su',
    Moon: 'Mo',
    Mars: 'Ma',
    Mercury: 'Me',
    Jupiter: 'Ju',
    Venus: 'Ve',
    Saturn: 'Sa',
    Rahu: 'Ra',
    Ketu: 'Ke',
    Uranus: 'Ur',
    Neptune: 'Ne',
    Pluto: 'Pl',
  };
  return names[planetName] || planetName.substring(0, 1);
}

export const getPlanetDisplay = (
  planetName: PlanetName,
  mode: PlanetDisplayMode,
  planets?: PlanetaryPositions | PlanetaryPositionsWithRetrograde,
  showRetrograde: boolean = true
): string => {
  const baseDisplay =
    mode === 'symbols'
      ? getPlanetSymbol(planetName)
      : getPlanetName(planetName);

  if (!planets || !showRetrograde) {
    return baseDisplay;
  }

  const { retrogradeInfo } = normalizePlanetaryPositions(planets);
  const isRetrograde = retrogradeInfo[planetName];

  if (isRetrograde) {
    return baseDisplay;
  }

  return baseDisplay;
};

export function formatDegree(degree: number): string {
  const degreeWithinSign = degree % 30;
  const wholeDegrees = Math.floor(degreeWithinSign);
  // Round to nearest minute to avoid floating-point precision issues
  const minutes = Math.floor((degreeWithinSign - wholeDegrees) * 60);

  // Handle the case where rounding gives us 60 minutes
  if (minutes >= 60) {
    return `${wholeDegrees + 1}°00'`;
  }

  return `${wholeDegrees}°${minutes.toString().padStart(2, '0')}'`;
}

export const getPlanetDegree = (
  planetName: PlanetName,
  planets: PlanetaryPositions | PlanetaryPositionsWithRetrograde,
  allowKetuOverride: boolean = false,
  showRetrograde: boolean = true
): string => {
  const { positions, retrogradeInfo } = normalizePlanetaryPositions(planets);

  let degree = positions[planetName];

  if (planetName === 'Ketu' && !allowKetuOverride) {
    degree = normalizeDegree(positions.Rahu + 180);
  }

  const degreeStr = formatDegree(degree!);
  const isRetrograde = retrogradeInfo[planetName];

  if (showRetrograde && isRetrograde) {
    return `${degreeStr}`; // ℞ is the retrograde symbol
  }

  return degreeStr;
};
