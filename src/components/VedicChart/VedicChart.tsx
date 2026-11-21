import { Component } from 'solid-js';
import { VedicChartProps } from '../../types';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';

const VedicChart: Component<VedicChartProps> = (props) => {
  const chartProps = () => ({
    planets: props.planets,
    ascendant: props.ascendant,
    ayanamsa: props.ayanamsa,
    width: props.width || 600,
    height: props.height || 600,
    showHouseLabels: props.showHouseLabels ?? true,
    planetDisplayMode: props.planetDisplayMode || 'symbols',
    allowKetuOverride: props.allowKetuOverride || false,
    showRetrograde: props.showRetrograde ?? true,
    onSelectLagna: props.onSelectLagna,
    lagnaMarker: props.lagnaMarker,
    bhavaChalit: props.bhavaChalit,
    customMarkers: props.customMarkers,
  });

  return (
    <div class={['vedic-chart', props.theme]}>
      {(props.style || 'north') === 'north' ? (
        <NorthIndianChart {...chartProps()} />
      ) : (
        <SouthIndianChart {...chartProps()} />
      )}
    </div>
  );
};

export default VedicChart;

// Named export for alternative import style
export { VedicChart };
