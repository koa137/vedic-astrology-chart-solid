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

/** How far right of its origin a text's ink starts (a glyph's left side
 *  bearing: Arial's "1" starts well inside its box). */
function inkStart(text: string, font: string): number {
  if (!text || !measureCtx) return 0;
  measureCtx.font = font;
  return -measureCtx.measureText(text).actualBoundingBoxLeft || 0;
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

/** Where a superscript tag starts, from the start of the details: over the
 *  ink of their first character (past the leading space), so a tag sits
 *  flush over "1°…" as it does over "3°…". */
export const tagOffset = (details: string, tag: string): number => {
  const lead = details.match(/^\s*/)?.[0] ?? '';
  const first = details.charAt(lead.length);
  return (
    detailsWidth(lead) +
    inkStart(first, `${10 * fontScale()}px Arial, sans-serif`) -
    inkStart(tag.charAt(0), `${6.5 * fontScale()}px Arial, sans-serif`)
  );
};

/** How far a superscript tag rises above the label's baseline (px). */
export const tagRise = (): number => 9 * fontScale();

/** The width of a label's details, or of its tag set above their start
 *  (after the details' leading space), whichever is wider. */
export const detailsPartWidth = (details: string, tag = ''): number =>
  Math.max(detailsWidth(details), tag ? detailsWidth(' ') + tagWidth(tag) : 0);

/** A label's width: its symbol, then its details part. */
export const labelWidth = (symbol: string, details: string, tag = ''): number =>
  symbolWidth(symbol) + detailsPartWidth(details, tag);

/** A house's stacked labels share one layout: the symbols in a column as wide
 *  as the widest, and every label's details starting after it, so the degrees
 *  line up. Returns that column's width and the whole block's width. */
export const labelBlock = (
  labels: { symbol: string; details: string; tag?: string }[]
): { column: number; width: number } => {
  let column = 0;
  let rest = 0;
  for (const l of labels) {
    column = Math.max(column, symbolWidth(l.symbol));
    rest = Math.max(rest, detailsPartWidth(l.details, l.tag));
  }
  return { column, width: column + rest };
};
