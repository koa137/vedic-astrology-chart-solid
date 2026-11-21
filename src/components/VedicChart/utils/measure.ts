// Measure rendered label widths so a label can be laid out exactly: centred
// on a house, clamped to the chart's border, its superscript set above the
// start of its details. Fonts must match vedic-chart.css (.planet-text,
// .planet-tag, .planet-details).
let measureCtx: CanvasRenderingContext2D | null | undefined;
function textWidth(text: string, font: string): number {
  if (measureCtx === undefined) {
    measureCtx =
      typeof document !== 'undefined'
        ? document.createElement('canvas').getContext('2d')
        : null;
  }
  if (!measureCtx) return text.length * 7; // SSR / no-canvas fallback
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

// The labels' font scale: the `--vedic-font-scale` custom property the
// stylesheet sizes them by (set on the document root).
export function fontScale(): number {
  if (typeof document === 'undefined') return 1;
  const v = parseFloat(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--vedic-font-scale')
  );
  return Number.isFinite(v) && v > 0 ? v : 1;
}

export const symbolWidth = (symbol: string): number =>
  textWidth(symbol, `bold ${12 * fontScale()}px Arial, sans-serif`);
export const detailsWidth = (details: string): number =>
  textWidth(details, `${10 * fontScale()}px Arial, sans-serif`);
const tagWidth = (tag: string): number =>
  textWidth(tag, `${6.5 * fontScale()}px Arial, sans-serif`);

/** How far a superscript tag rises above the label's baseline (px). */
export const tagRise = (): number => 9 * fontScale();

/** A label's width: its symbol, then its details with any tag set above their
 *  start (after the details' leading space), whichever is wider. */
export const labelWidth = (
  symbol: string,
  details: string,
  tag = ''
): number =>
  symbolWidth(symbol) +
  Math.max(
    detailsWidth(details),
    tag ? detailsWidth(' ') + tagWidth(tag) : 0
  );
