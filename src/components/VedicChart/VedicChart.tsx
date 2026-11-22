import { Component } from 'solid-js';
import { VedicChartProps } from '../../types';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';
import CircleChart from './CircleChart';

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
    placements: props.placements,
    details: props.details,
    tags: props.tags,
    ascendantDetails: props.ascendantDetails,
    customMarkers: props.customMarkers,
    rowSpacing: props.rowSpacing,
  });

  return (
    <div class={['vedic-chart', props.theme]}>
      {(props.style || 'north') === 'north' ? (
        <NorthIndianChart {...chartProps()} />
      ) : props.style === 'circle' ? (
        <CircleChart {...chartProps()} />
      ) : (
        <SouthIndianChart {...chartProps()} />
      )}
    </div>
  );
};

export default VedicChart;

// Named export for alternative import style
export { VedicChart };
