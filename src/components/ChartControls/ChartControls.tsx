import { Component } from 'solid-js';

interface ChartControlsProps {
  selectedStyle: 'north' | 'south';
  onStyleChange: (style: 'north' | 'south') => void;
  showNakshatras: boolean;
  onToggleNakshatras: () => void;
}

const ChartControls: Component<ChartControlsProps> = (props) => {
  return (
    <div>
      <h3>Chart Controls</h3>
      <div>
        <label>
          <input
            type="radio"
            value="north"
            checked={props.selectedStyle === 'north'}
            onChange={() => props.onStyleChange('north')}
          />
          North Indian
        </label>
        <label>
          <input
            type="radio"
            value="south"
            checked={props.selectedStyle === 'south'}
            onChange={() => props.onStyleChange('south')}
          />
          South Indian
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={props.showNakshatras}
            onChange={() => props.onToggleNakshatras()}
          />
          Show Nakshatras
        </label>
      </div>
    </div>
  );
};

export default ChartControls;
