import { Component, For, Show } from 'solid-js';
import { PlanetName, VedicChartProps } from '../../types';
import {
  formatDegree,
  getPlanetDisplay,
  normalizePlanetaryPositions,
} from '../../utils';
import { detailsWidth, fontScale, symbolWidth } from './utils/measure';
import '../../styles/vedic-chart.css';

type ChartProps = Omit<VedicChartProps, 'style'> & {
  showRetrograde?: boolean;
};

const SIGN_GLYPHS = [
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
];
const SIGN_ABBRS = [
  'Ari',
  'Tau',
  'Gem',
  'Can',
  'Leo',
  'Vir',
  'Lib',
  'Sco',
  'Sag',
  'Cap',
  'Aqu',
  'Pis',
];
// Each sign's element, for its colour: Aries fire, Taurus earth, Gemini air,
// Cancer water, and round again.
const ELEMENTS = ['fire', 'earth', 'air', 'water'];
const signClass = (s: number) => `sign-${ELEMENTS[s % 4]}`;
// Text presentation, so the glyphs aren't drawn as emoji.
const TEXT_STYLE = '︎';

const norm = (x: number) => ((x % 360) + 360) % 360;

/** Spread angles (degrees) so neighbours don't overlap: `halfWidth(i, at)`
 *  is item i's angular half-width (degrees) when drawn at angle `at`. Each
 *  moves as little as possible; returns them in input order. */
function spread(
  angles: number[],
  halfWidth: (i: number, at: number) => number
): number[] {
  const n = angles.length;
  if (n < 2) return angles.slice();
  const order = angles
    .map((a, i) => ({ a: norm(a), i }))
    .sort((x, y) => x.a - y.a);
  const pos = order.map((o) => o.a);
  for (let iter = 0; iter < 300; iter++) {
    let moved = false;
    const hw = pos.map((p, k) => halfWidth(order[k].i, p));
    // Never ask for more than the whole circle.
    const total = hw.reduce((a, b) => a + 2 * b, 0);
    const fit = total > 360 ? 360 / total : 1;
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n;
      let gap = pos[j] - pos[k];
      if (j === 0) gap += 360;
      const need = (hw[k] + hw[j]) * fit;
      if (gap < need - 1e-6) {
        const push = (need - gap) / 2;
        pos[k] -= push;
        pos[j] += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(n);
  order.forEach((o, k) => (out[o.i] = pos[k]));
  return out;
}

/** A circular, Western-style wheel: the zodiac in an outer ring with the
 *  ascendant at 9 o'clock and the signs running counterclockwise, whole-sign
 *  houses numbered on an inner ring, and each body at its own degree (spread
 *  apart where they crowd, with a pointer to its true position). */
const CircleChart: Component<ChartProps> = (props) => {
  const width = () => props.width || 600;
  const height = () => props.height || 600;
  const cx = () => width() / 2;
  const cy = () => height() / 2;
  const R = () => Math.min(width(), height()) / 2 - 3;
  const fs = () => fontScale();

  // Ring radii.
  const rSign = () => R() * 0.84; // inner edge of the zodiac ring
  const rInner = () => R() * 0.4; // outer edge of the house-number ring
  const rCore = () => R() * 0.28; // the empty centre
  // Outer edge of the degree scale (its 10° ticks).
  const rScale = () => rSign() + R() * 0.045;

  // One path of ticks: every `step` degrees (1 → the fine ones, skipping
  // multiples of 5; 5 → the 5° and longer 10° ones), skipping sign cusps.
  const ticks = (step: number) => {
    let d = '';
    for (let lon = 0; lon < 360; lon += step) {
      if (lon % 30 === 0 || (step === 1 && lon % 5 === 0)) continue;
      const len = R() * (lon % 10 === 0 ? 0.045 : lon % 5 === 0 ? 0.03 : 0.016);
      const a = point(lon, rSign());
      const b = point(lon, rSign() + len);
      d += `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    }
    return d;
  };

  const mode = () => props.planetDisplayMode || 'symbols';

  // The wheel turns so `ascendant` sits on the left; longitudes increase
  // counterclockwise.
  const point = (lon: number, r: number) => {
    const a = Math.PI + ((lon - props.ascendant) * Math.PI) / 180;
    return { x: cx() + r * Math.cos(a), y: cy() - r * Math.sin(a) };
  };

  const ascSign = () => Math.floor(norm(props.ascendant) / 30);

  // Every body to draw, with its own longitude (Ketu opposite Rahu unless
  // overridden).
  const bodies = () => {
    const { positions, retrogradeInfo } = normalizePlanetaryPositions(
      props.planets
    );
    return Object.keys(positions).map((name) => {
      const lon =
        name === 'Ketu' && !(props.allowKetuOverride || false)
          ? norm((positions.Rahu ?? 0) + 180)
          : norm(positions[name as PlanetName] ?? 0);
      return { name, lon, retro: !!retrogradeInfo[name] };
    });
  };

  // A body's label lines, from the outside in: its name, any tag, then its
  // details (degree by default) a token per line.
  const symbolOf = (name: string) => {
    const s = getPlanetDisplay(
      name as PlanetName,
      mode(),
      props.planets,
      false
    );
    // A lone glyph (☉, ♂…) in text style, not emoji.
    return [...s].length === 1 ? s + TEXT_STYLE : s;
  };
  // A label's details, a line each: the given details split on spaces, or by
  // default degree, sign and minutes (3° ♒ 24').
  const detailLines = (given: string | undefined, lon: number): Line[] => {
    if (given !== undefined)
      return given.trim().split(/\s+/).filter(Boolean).map(detailLine);
    const [deg, min] = formatDegree(norm(lon) % 30).split('°');
    const s = Math.floor(norm(lon) / 30);
    return [
      detailLine(`${deg}°`),
      signLine(s),
      ...(min ? [detailLine(min)] : []),
    ];
  };

  // A label is a stack of lines from the rim inward: name, tag, details.
  type Line = { text: string; cls?: string; w: number; h: number };
  const rName = () => rSign() - 15 * fs();
  // Screen angle (radians) of a longitude.
  const angle = (lon: number) =>
    Math.PI + ((lon - props.ascendant) * Math.PI) / 180;

  // Each line's radius at a given angle: far enough inward to clear the line
  // before it in whichever direction the stack runs (down at the top and
  // bottom, sideways at 3 and 9 o'clock).
  const radii = (lines: Line[], at: number): number[] => {
    const a = angle(at);
    const ux = Math.max(Math.abs(Math.cos(a)), 1e-3);
    const uy = Math.max(Math.abs(Math.sin(a)), 1e-3);
    const out = [rName()];
    for (let k = 1; k < lines.length; k++) {
      const p = lines[k - 1];
      const q = lines[k];
      const step = Math.min(
        ((p.w + q.w) / 2 + 3 * fs()) / ux,
        ((p.h + q.h) / 2 + 1) / uy
      );
      out.push(out[k - 1] - step);
    }
    return out;
  };
  // A label's angular half-width (degrees) at an angle: its widest line
  // measured along the circle.
  const halfWidth = (lines: Line[], at: number): number => {
    const a = angle(at);
    const rs = radii(lines, at);
    let hw = 0;
    lines.forEach((l, k) => {
      const ext = l.w * Math.abs(Math.sin(a)) + l.h * Math.abs(Math.cos(a));
      hw = Math.max(hw, (ext / 2 + 2 * fs()) / Math.max(rs[k], 1));
    });
    return (hw * 180) / Math.PI;
  };

  const nameLine = (text: string): Line => ({
    text,
    w: symbolWidth(text) * (mode() === 'symbols' ? 1.6 : 1.15),
    h: (mode() === 'symbols' ? 20 : 14) * fs(),
  });
  const tagLine = (text: string): Line => ({
    text,
    cls: 'planet-tag',
    w: detailsWidth(text) * 0.65,
    h: 7 * fs(),
  });
  const detailLine = (text: string): Line => ({
    text,
    cls: 'planet-details',
    w: detailsWidth(text),
    h: 10.5 * fs(),
  });
  const signLine = (s: number): Line =>
    mode() === 'symbols'
      ? {
          text: SIGN_GLYPHS[s] + TEXT_STYLE,
          cls: `wheel-sign-token ${signClass(s)}`,
          w: 13 * fs(),
          h: 13 * fs(),
        }
      : {
          text: SIGN_ABBRS[s],
          cls: `wheel-sign-token ${signClass(s)}`,
          w: detailsWidth(SIGN_ABBRS[s]),
          h: 10.5 * fs(),
        };

  // Where each body's label sits, spread so none overlap. (The ascendant is
  // marked by its axis instead, labelled at the rim and the inner circle.)
  const layout = () => {
    const items = [
      ...bodies().map((b) => {
        const tag = props.tags?.[b.name] ?? '';
        return {
          key: b.name,
          lon: b.lon,
          retro: b.retro,
          isAsc: false,
          lines: [
            nameLine(symbolOf(b.name)),
            ...(tag ? [tagLine(tag)] : []),
            ...detailLines(props.details?.[b.name], b.lon),
          ],
        };
      }),
    ];
    const shown = spread(
      items.map((it) => it.lon),
      // Called synchronously, within this (tracked) layout.
      // eslint-disable-next-line solid/reactivity
      (i, at) => halfWidth(items[i].lines, at)
    );
    return items.map((it, i) => ({
      ...it,
      at: shown[i],
      radii: radii(it.lines, shown[i]),
    }));
  };

  // Custom markers (e.g. arudhas): a ring of their own just outside the
  // house numbers.
  const markers = () => {
    const ms = props.customMarkers ?? [];
    const r = rInner() + 11 * fs();
    const at = spread(
      ms.map((m) => norm(m.position)),
      // Called synchronously, within this (tracked) layout.
      // eslint-disable-next-line solid/reactivity
      (i, a) => {
        const t = angle(a);
        const ext =
          (detailsWidth(ms[i].label) + 4) * Math.abs(Math.sin(t)) +
          10 * fs() * Math.abs(Math.cos(t));
        return ((ext / 2 / r) * 180) / Math.PI;
      }
    );
    return ms.map((m, i) => ({ ...m, at: at[i], r }));
  };

  // The ascendant–descendant axis's labels: each end's degree at the rim, on
  // the 12th/6th-house side of the line, and its name (with the ascendant's
  // details on the other side) at the inner end.
  const rRim = () => (R() + rScale()) / 2;
  // The rim label's radius: in the zodiac ring, pulled in so a wide label
  // stays inside the rim.
  const rimR = (lon: number, w: number) => {
    const a = angle(lon);
    const reach =
      (w * Math.abs(Math.cos(a)) + 11 * fs() * Math.abs(Math.sin(a))) / 2;
    return Math.min(rRim(), R() - reach - 3);
  };
  const rAxisName = () => rInner() + 12 * fs();
  // The angle (degrees) that clears a w×h label of the line at radius r.
  const clear = (lon: number, r: number, w: number, h: number) => {
    const a = angle(lon);
    const ext = w * Math.abs(Math.sin(a)) + h * Math.abs(Math.cos(a));
    return ((ext / 2 + 4 * fs()) / r) * (180 / Math.PI);
  };
  const axisLabels = () => {
    const asc = norm(props.lagnaMarker ?? props.ascendant);
    // Both ends share a degree; take it from the ascendant (lon + 180 can
    // round to the minute below).
    const degree = formatDegree(asc % 30);
    return [0, 180].map((off) => {
      const lon = norm(asc + off);
      const dw = detailsWidth(degree) * 1.15;
      const name = off === 0 ? 'As' : 'Ds';
      const details = off === 0 ? props.ascendantDetails : undefined;
      return {
        lon,
        degree,
        name,
        cls: off === 0 ? 'wheel-axis-as' : 'wheel-axis-ds',
        details,
        rimAt: lon - clear(lon, rimR(lon, dw), dw, 11 * fs()),
        rimR: rimR(lon, dw),
        nameAt: lon - clear(lon, rAxisName(), symbolWidth(name), 12 * fs()),
        detailsAt:
          lon + clear(lon, rAxisName(), detailsWidth(details ?? ''), 11 * fs()),
      };
    });
  };
  // Where a sign's glyph sits: mid-sign, unless an axis label is there, then
  // toward whichever end of the sign is clearer.
  const signAt = (s: number) => {
    const mid = s * 30 + 15;
    const near = axisLabels().filter(
      (l) => Math.abs(norm(l.rimAt - mid + 180) - 180) < 9
    );
    if (!near.length) return mid;
    const at = near[0].rimAt;
    const lo = s * 30 + 5;
    const hi = s * 30 + 25;
    const dist = (x: number) => Math.abs(norm(x - at + 180) - 180);
    return dist(lo) > dist(hi) ? lo : hi;
  };

  // Right-click: view the chart from this longitude.
  const select = (e: { preventDefault: () => void }, lon: number) => {
    if (!props.onSelectLagna) return;
    e.preventDefault();
    props.onSelectLagna(lon);
  };
  const clickable = () =>
    props.onSelectLagna ? { cursor: 'context-menu' } : undefined;

  return (
    <svg
      width={width()}
      height={height()}
      viewBox={`0 0 ${width()} ${height()}`}
      class={[
        'vedic-chart-svg vedic-chart-circle',
        { 'wheel-symbols': mode() === 'symbols' },
      ]}
    >
      {/* Rings */}
      <circle cx={cx()} cy={cy()} r={R()} class="chart-border wheel-face" />
      <circle cx={cx()} cy={cy()} r={rSign()} class="chart-lines" />
      <circle cx={cx()} cy={cy()} r={rInner()} class="chart-lines" />
      <circle cx={cx()} cy={cy()} r={rCore()} class="chart-lines" />

      {/* Sign (and, by whole sign, house) boundaries: solid through the
          zodiac and house-number rings, faint across the planets. */}
      <For each={Array.from({ length: 12 }, (_, k) => k * 30)}>
        {(lon) => {
          const a = () => point(lon, R());
          const b = () => point(lon, rSign());
          const c = () => point(lon, rInner());
          const d = () => point(lon, rCore());
          return (
            <>
              <line
                x1={a().x}
                y1={a().y}
                x2={b().x}
                y2={b().y}
                class="chart-lines"
              />
              <line
                x1={b().x}
                y1={b().y}
                x2={c().x}
                y2={c().y}
                class="chart-lines wheel-cusp"
              />
              <line
                x1={c().x}
                y1={c().y}
                x2={d().x}
                y2={d().y}
                class="chart-lines"
              />
            </>
          );
        }}
      </For>

      {/* A graduated scale along the zodiac ring's inner edge: a tick every
          degree, longer every 5° and 10°. */}
      <path d={ticks(1)} class="chart-lines wheel-tick wheel-tick-fine" />
      <path d={ticks(5)} class="chart-lines wheel-tick" />

      {/* Signs */}
      <For each={Array.from({ length: 12 }, (_, k) => k)}>
        {(s) => {
          const p = () => point(signAt(s), (R() + rScale()) / 2);
          return (
            <text
              x={p().x}
              y={p().y}
              text-anchor="middle"
              dominant-baseline="central"
              class={[
                'sign-label',
                `sign-${SIGN_ABBRS[s].toLowerCase()}`,
                signClass(s),
              ]}
              style={clickable()}
              onContextMenu={(e) => select(e, s * 30)}
            >
              {mode() === 'symbols'
                ? SIGN_GLYPHS[s] + TEXT_STYLE
                : SIGN_ABBRS[s]}
            </text>
          );
        }}
      </For>

      {/* House numbers (whole sign, from the ascendant's sign) */}
      <Show when={props.showHouseLabels ?? true}>
        <For each={Array.from({ length: 12 }, (_, k) => k)}>
          {(h) => {
            const sign = () => (ascSign() + h) % 12;
            const p = () => point(sign() * 30 + 15, (rInner() + rCore()) / 2);
            return (
              <text
                x={p().x}
                y={p().y}
                text-anchor="middle"
                dominant-baseline="central"
                class="house-label"
                style={clickable()}
                onContextMenu={(e) => select(e, sign() * 30)}
              >
                {h + 1}
              </text>
            );
          }}
        </For>
      </Show>

      {/* The ascendant–descendant axis: bold lines from the inner circle out
          through the zodiac ring. */}
      <For each={[0, 180]}>
        {(off) => {
          const lon = () => norm(props.lagnaMarker ?? props.ascendant) + off;
          const a = () => point(lon(), R());
          const b = () => point(lon(), rCore());
          return (
            <line
              x1={a().x}
              y1={a().y}
              x2={b().x}
              y2={b().y}
              class={['wheel-asc-line', { 'wheel-dsc-line': off === 180 }]}
            />
          );
        }}
      </For>
      <For each={axisLabels()}>
        {(l) => (
          <>
            {/* The degree at the rim, beside the line */}
            <text
              x={point(l.rimAt, l.rimR).x}
              y={point(l.rimAt, l.rimR).y}
              text-anchor="middle"
              dominant-baseline="central"
              class="wheel-axis-degree"
            >
              {l.degree}
            </text>
            {/* As / Ds at the inner end, with the ascendant's details below */}
            <text
              x={point(l.nameAt, rAxisName()).x}
              y={point(l.nameAt, rAxisName()).y}
              text-anchor="middle"
              dominant-baseline="central"
              class={['wheel-axis-name', l.cls]}
            >
              {l.name}
            </text>
            <Show when={l.details}>
              <text
                x={point(l.detailsAt, rAxisName()).x}
                y={point(l.detailsAt, rAxisName()).y}
                text-anchor="middle"
                dominant-baseline="central"
                class="planet-details wheel-axis-details"
              >
                {l.details}
              </text>
            </Show>
          </>
        )}
      </For>

      {/* Bodies and the ascendant label */}
      <For each={layout()}>
        {(it) => {
          // Pointer from the true degree to the label, when it's been moved.
          const moved = () => Math.abs(norm(it.at - it.lon + 180) - 180) > 0.5;
          const tickA = () => point(it.lon, rSign());
          const tickB = () => point(it.lon, rSign() - 4 * fs());
          const lead = () => point(it.at, it.radii[0] + 7 * fs());
          return (
            <g
              class={[
                'wheel-body',
                it.isAsc
                  ? 'ascendant-text'
                  : ['planet-text', `planet-${it.key.toLowerCase()}`],
                { retrograde: it.retro },
              ]}
              style={clickable()}
              onContextMenu={(e) => select(e, it.lon)}
            >
              <Show when={!it.isAsc}>
                <line
                  x1={tickA().x}
                  y1={tickA().y}
                  x2={tickB().x}
                  y2={tickB().y}
                  class="wheel-pointer"
                />
                <Show when={moved()}>
                  <line
                    x1={tickB().x}
                    y1={tickB().y}
                    x2={lead().x}
                    y2={lead().y}
                    class="wheel-pointer wheel-leader"
                  />
                </Show>
              </Show>
              <For each={it.lines}>
                {(l, k) => (
                  <text
                    x={point(it.at, it.radii[k()]).x}
                    y={point(it.at, it.radii[k()]).y}
                    text-anchor="middle"
                    dominant-baseline="central"
                    class={k() === 0 ? undefined : l.cls}
                  >
                    {k() === 0 ? (
                      <tspan class={it.isAsc ? undefined : 'planet-symbol'}>
                        {l.text}
                      </tspan>
                    ) : (
                      l.text
                    )}
                  </text>
                )}
              </For>
            </g>
          );
        }}
      </For>

      {/* Custom markers */}
      <For each={markers()}>
        {(m) => {
          const p = () => point(m.at, m.r);
          return (
            <text
              x={p().x}
              y={p().y}
              text-anchor="middle"
              dominant-baseline="central"
              class={['custom-marker-text', m.className]}
            >
              {m.label}
              <Show when={m.details}>
                <tspan class="planet-details"> {m.details}</tspan>
              </Show>
            </text>
          );
        }}
      </For>
    </svg>
  );
};

export default CircleChart;
