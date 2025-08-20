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
- **Reactive**: Built with SolidJS for optimal performance and fine-grained reactivity

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

## Example Charts
<img width="625" height="759" alt="Screenshot 2025-08-20 at 14 12 14" src="https://github.com/user-attachments/assets/6bf7882c-2247-47b7-88b5-a95e60213a30" />

<img width="625" height="736" alt="Screenshot 2025-08-20 at 14 12 32" src="https://github.com/user-attachments/assets/60016f0d-f3f0-4018-ab93-a66d2b834e14" />



## API Reference

### VedicChart Props

| Prop                | Type                   | Default      | Description                                     |
| ------------------- | ---------------------- | ------------ | ----------------------------------------------- |
| `planets`           | `PlanetaryPositions`   | **required** | Sidereal planetary positions in degrees (0-360) |
| `ascendant`         | `number`               | **required** | Sidereal ascendant position in degrees          |
| `ayanamsa`          | `number`               | optional     | Ayanamsa value (informational only)             |
| `style`             | `'north' \| 'south'`   | `'north'`    | Chart style format                              |
| `width`             | `number`               | `600`        | SVG width in pixels                             |
| `height`            | `number`               | `600`        | SVG height in pixels                            |
| `showHouseLabels`   | `boolean`              | `true`       | Show zodiac sign numbers in houses              |
| `planetDisplayMode` | `'symbols' \| 'names'` | `'symbols'`  | How to display planets                          |
| `allowKetuOverride` | `boolean`              | `false`      | Allow manual Ketu positioning                   |

### Planet Positions Interface

```tsx
interface PlanetaryPositions {
  Sun: number;
  Moon: number;
  Mars: number;
  Mercury: number;
  Jupiter: number;
  Venus: number;
  Saturn: number;
  Rahu: number; // North Node
  Ketu: number; // South Node (auto-calculated if allowKetuOverride is false)
}
```

## Advanced Usage

### Interactive Chart with Controls

```tsx
import { createSignal } from 'solid-js';
import { VedicChart } from 'vedic-astrology-chart-solid';
import type {
  ChartStyle,
  PlanetDisplayMode,
} from 'vedic-astrology-chart-solid/types';

function InteractiveChart() {
  const [style, setStyle] = createSignal<ChartStyle>('north');
  const [planetDisplayMode, setPlanetDisplayMode] =
    createSignal<PlanetDisplayMode>('symbols');
  const [showHouseLabels, setShowHouseLabels] = createSignal(true);

  const birthChart = {
    planets: {
      Sun: 95.5,
      Moon: 145.2,
      Mars: 310.7,
      Mercury: 108.8,
      Jupiter: 85.2,
      Venus: 200.3,
      Saturn: 270.5,
      Rahu: 42.3,
      Ketu: 222.3,
    },
    ascendant: 15.5,
  };

  return (
    <div>
      <div style={{ 'margin-bottom': '20px' }}>
        <button onClick={() => setStyle('north')}>North Indian</button>
        <button onClick={() => setStyle('south')}>South Indian</button>
        <button
          onClick={() =>
            setPlanetDisplayMode(
              planetDisplayMode() === 'symbols' ? 'names' : 'symbols'
            )
          }
        >
          Toggle Planet Display
        </button>
        <button onClick={() => setShowHouseLabels(!showHouseLabels())}>
          Toggle House Labels
        </button>
      </div>

      <VedicChart
        {...birthChart}
        style={style()}
        planetDisplayMode={planetDisplayMode()}
        showHouseLabels={showHouseLabels()}
        width={600}
        height={600}
      />
    </div>
  );
}
```

### Custom Planet Colors and Styling

The component uses built-in colors for planets, but you can override styles by targeting the SVG elements:

```css
.vedic-chart svg text {
  font-family: 'Arial', sans-serif;
}

.vedic-chart svg tspan[fill='#FF6B35'] {
  fill: #ff0000; /* Custom Sun color */
}
```

## Planet Display Modes

### Symbols Mode (`planetDisplayMode="symbols"`)

- Sun: ☉
- Moon: ☽
- Mars: ♂
- Mercury: ☿
- Jupiter: ♃
- Venus: ♀
- Saturn: ♄
- Rahu: ☊
- Ketu: ☋

### Names Mode (`planetDisplayMode="names"`)

- Sun: Su
- Moon: Mo
- Mars: Ma
- Mercury: Me
- Jupiter: Ju
- Venus: Ve
- Saturn: Sa
- Rahu: Ra
- Ketu: Ke

## Chart Styles

### North Indian Style

- Diamond-shaped layout
- Traditional North Indian format
- Houses arranged in diamond pattern
- Ascendant always at the top

### South Indian Style

- Grid-based layout (3x3 with center removed)
- Traditional South Indian format
- Fixed house positions
- Leo always in the top-left corner

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

### Building the Library

```bash
# Build for production
bun run build

# Run linting
bun run lint

# Format code
bun run format

# Type checking
bun run type-check
```

## Requirements

- **SolidJS**: ^1.8.0
- **TypeScript**: ^5.0.0 (for TypeScript projects)
- **Modern Browser**: Supports SVG rendering

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: Latest 2 versions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests and linting (`bun run lint && bun run type-check`)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Roadmap

- [ ] Divisional charts (D2, D9, D10, etc.)
- [ ] Nakshatra displays
- [ ] Planetary aspects visualization
- [ ] Chart comparison tools
- [ ] Animation support for transits
- [ ] Dark mode support
- [ ] Export to PNG/SVG
- [ ] Custom color themes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with **SolidJS** for optimal performance and reactivity
- **TypeScript** for type safety and developer experience
- **SVG-based rendering** for crisp, scalable charts
- Follows traditional **Vedic astrology principles**
- Accurate **whole sign house system** implementation
- Inspired by classical Indian astronomical texts

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/koa137/vedic-astrology-chart-solid/issues) page
2. Create a new issue with detailed information
3. Join our [Discussions](https://github.com/koa137/vedic-astrology-chart-solid/discussions) for community help

---

**Note**: This library focuses on accurate Vedic astrology calculations using the sidereal zodiac and whole sign house system. For tropical astrology or other house systems, consider using a different library or adapting the calculations accordingly.
