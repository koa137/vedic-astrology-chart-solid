import { createSignal, Component } from 'solid-js';
import { VedicChart } from './components/VedicChart';
import { sampleChartData } from './data';
import type { ChartStyle, PlanetDisplayMode } from './types';

const App: Component = () => {
  const [style, setStyle] = createSignal<ChartStyle>('north');
  const [planetDisplayMode, setPlanetDisplayMode] =
    createSignal<PlanetDisplayMode>('symbols');
  const [showHouseLabels, setShowHouseLabels] = createSignal(true);

  return (
    <div style={{ padding: '20px', 'text-align': 'center' }}>
      <h1>Vedic Astrology Chart Demo</h1>

      <div style={{ 'margin-bottom': '20px' }}>
        <button
          onClick={() => setStyle('north')}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            'background-color': style() === 'north' ? '#007bff' : '#f8f9fa',
            color: style() === 'north' ? 'white' : 'black',
            border: '1px solid #ccc',
            'border-radius': '4px',
            cursor: 'pointer',
          }}
        >
          North Indian Style
        </button>
        <button
          onClick={() => setStyle('south')}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            'background-color': style() === 'south' ? '#007bff' : '#f8f9fa',
            color: style() === 'south' ? 'white' : 'black',
            border: '1px solid #ccc',
            'border-radius': '4px',
            cursor: 'pointer',
          }}
        >
          South Indian Style
        </button>
      </div>

      <div style={{ 'margin-bottom': '20px' }}>
        <button
          onClick={() => setPlanetDisplayMode('symbols')}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            'background-color':
              planetDisplayMode() === 'symbols' ? '#28a745' : '#f8f9fa',
            color: planetDisplayMode() === 'symbols' ? 'white' : 'black',
            border: '1px solid #ccc',
            'border-radius': '4px',
            cursor: 'pointer',
          }}
        >
          Planet Symbols (☉♂♃)
        </button>
        <button
          onClick={() => setPlanetDisplayMode('names')}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            'background-color':
              planetDisplayMode() === 'names' ? '#28a745' : '#f8f9fa',
            color: planetDisplayMode() === 'names' ? 'white' : 'black',
            border: '1px solid #ccc',
            'border-radius': '4px',
            cursor: 'pointer',
          }}
        >
          Planet Names (Su, Ma, Ju)
        </button>
      </div>

      <div style={{ 'margin-bottom': '20px' }}>
        <button
          onClick={() => setShowHouseLabels(!showHouseLabels())}
          style={{
            margin: '0 10px',
            padding: '10px 20px',
            'background-color': showHouseLabels() ? '#6c757d' : '#f8f9fa',
            color: showHouseLabels() ? 'white' : 'black',
            border: '1px solid #ccc',
            'border-radius': '4px',
            cursor: 'pointer',
          }}
        >
          {showHouseLabels() ? 'Hide Sign Numbers' : 'Show Sign Numbers'}
        </button>
      </div>

      <VedicChart
        {...sampleChartData}
        style={style()}
        planetDisplayMode={planetDisplayMode()}
        showHouseLabels={showHouseLabels()}
        width={600}
        height={600}
      />
    </div>
  );
};

export default App;
