# Vedic Astrology Chart - SolidJS

## Overview

A beautiful SolidJS component for rendering Vedic (Jyotish) astrology charts. Supports both North Indian and South Indian chart formats with accurate whole sign house system calculations.

## Features

- **Dual Chart Formats**: North Indian (diamond) and South Indian (grid) styles
- **Whole Sign System**: Accurate Vedic astrology house calculations
- **Flexible Planet Display**: Choose between traditional astronomical symbols or abbreviated names
- **Sidereal Positions**: Works with sidereal planetary positions
- **Ascendant Display**: Shows ascendant with exact degrees in both chart formats
- **Smart Stacking**: Automatic vertical stacking when multiple planets occupy the same house
- **Rahu-Ketu Synchronization**: Ensures North and South nodes are exactly 180° apart
- **Dynamic House Labels**: Shows zodiac sign numbers (1-12) based on ascendant position
- **Customizable**: Adjustable dimensions, house numbers, zodiac labels
- **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install vedic-astrology-chart-solid
# or
bun add vedic-astrology-chart-solid
# or
yarn add vedic-astrology-chart-solid
```

## Quick Start

```tsx
import { VedicChart } from 'vedic-astrology-chart-solid';

function MyChart() {
  const birthChart = {
    planets: {
      Sun: 95.5, // Sidereal positions in degrees
      Moon: 145.2,
      Mars: 310.7,
      Mercury: 108.8,
      Jupiter: 85.2,
      Venus: 200.3,
      Saturn: 270.5,
      Rahu: 42.3, // North Node
      Ketu: 222.3, // South Node (automatically synchronized to be 180° from Rahu)
    },
    ascendant: 15.5, // Sidereal ascendant in degrees
  };

  return (
    <VedicChart
      {...birthChart}
      style="north" // or "south"
      width={600}
      height={600}
      showHouseLabels={true}
      planetDisplayMode="symbols" // or "names"
    />
  );
}
```

## Development

To run the demo locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/koa137/vedic-astrology-chart-solid.git
   cd vedic-astrology-chart-solid
   ```

2. Install dependencies:

   ```bash
   bun install
   # or npm install
   ```

3. Start the development server:

   ```bash
   bun run dev
   # or npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

The rest of the API documentation remains the same, but now built with SolidJS instead of React.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with SolidJS and TypeScript
- SVG-based rendering for crisp, scalable charts
- Follows traditional Vedic astrology principles
- Accurate whole sign house system implementation