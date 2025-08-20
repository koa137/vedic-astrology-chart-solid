import { Component, createSignal } from 'solid-js';

interface PlanetaryInputProps {
  onSubmit: (data: {
    planetaryPositions: string;
    ascendant: string;
    ayanamsa: string;
  }) => void;
}

const PlanetaryInput: Component<PlanetaryInputProps> = (props) => {
  const [planetaryPositions, setPlanetaryPositions] = createSignal('');
  const [ascendant, setAscendant] = createSignal('');
  const [ayanamsa, setAyanamsa] = createSignal('');

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    props.onSubmit({
      planetaryPositions: planetaryPositions(),
      ascendant: ascendant(),
      ayanamsa: ayanamsa(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Planetary Positions:
          <input
            type="text"
            value={planetaryPositions()}
            onInput={(e) => setPlanetaryPositions(e.currentTarget.value)}
            placeholder="e.g. Sun: 10°, Moon: 20°"
          />
        </label>
      </div>
      <div>
        <label>
          Ascendant:
          <input
            type="text"
            value={ascendant()}
            onInput={(e) => setAscendant(e.currentTarget.value)}
            placeholder="e.g. Aries"
          />
        </label>
      </div>
      <div>
        <label>
          Ayanamsa:
          <input
            type="text"
            value={ayanamsa()}
            onInput={(e) => setAyanamsa(e.currentTarget.value)}
            placeholder="e.g. 24°"
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default PlanetaryInput;
