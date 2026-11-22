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
  const detailTokens = (name: string, lon: number): string[] => {
    const d = props.details?.[name];
    return (d !== undefined ? d : formatDegree(lon % 30))
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };
  const ascTokens = () =>
    (props.ascendantDetails !== undefined
      ? props.ascendantDetails
      : formatDegree(norm(props.lagnaMarker ?? props.ascendant) % 30)
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);

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
    w: symbolWidth(text) * (mode() === 'symbols' ? 1.4 : 1.15),
    h: (mode() === 'symbols' ? 17 : 14) * fs(),
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

  // Where each label sits: bodies and the ascendant spread together so none
  // overlap.
  const layout = () => {
    const asc = norm(props.lagnaMarker ?? props.ascendant);
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
            ...detailTokens(b.name, b.lon).map(detailLine),
          ],
        };
      }),
      {
        key: '__asc',
        lon: asc,
        retro: false,
        isAsc: true,
        lines: [nameLine('As'), ...ascTokens().map(detailLine)],
      },
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

      {/* Degree ticks along the zodiac ring's inner edge: every 5°, longer
          every 10°. */}
      <For each={Array.from({ length: 72 }, (_, k) => k * 5)}>
        {(lon) => {
          const len = () => (lon % 10 === 0 ? 6 : 3.5) * fs();
          const a = () => point(lon, rSign());
          const b = () => point(lon, rSign() + len());
          return (
            <Show when={lon % 30 !== 0}>
              <line
                x1={a().x}
                y1={a().y}
                x2={b().x}
                y2={b().y}
                class="chart-lines wheel-tick"
              />
            </Show>
          );
        }}
      </For>

      {/* Signs */}
      <For each={Array.from({ length: 12 }, (_, k) => k)}>
        {(s) => {
          const p = () => point(s * 30 + 15, (R() + rSign()) / 2);
          return (
            <text
              x={p().x}
              y={p().y}
              text-anchor="middle"
              dominant-baseline="central"
              class={['sign-label', `sign-${SIGN_ABBRS[s].toLowerCase()}`]}
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

      {/* The ascendant's axis, across the house-number ring */}
      {(() => {
        const asc = () => norm(props.lagnaMarker ?? props.ascendant);
        const a = () => point(asc(), rInner());
        const b = () => point(asc(), rCore());
        return (
          <line
            x1={a().x}
            y1={a().y}
            x2={b().x}
            y2={b().y}
            class="wheel-asc-line"
          />
        );
      })()}

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
