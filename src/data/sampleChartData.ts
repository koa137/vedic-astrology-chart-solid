import { VedicChartData } from '../types';

export const sampleChartData: VedicChartData = {
  planets: {
    Sun: 95.5,
    Moon: 145.2,
    Mars: { position: 310.7, isRetrograde: true }, // Retrograde Mars
    Mercury: { position: 108.8, isRetrograde: true }, // Retrograde Mercury
    Jupiter: 85.2,
    Venus: 200.3,
    Saturn: { position: 270.5, isRetrograde: true }, // Retrograde Saturn
    Rahu: 42.3,
    Ketu: 222.3,
    Uranus: 300.0, // Optional outer planets
    Neptune: 320.0,
    Pluto: 340.0,
  },
  ascendant: 236.1, // Sidereal ascendant
  ayanamsa: 24.12, // Lahiri ayanamsa
};
