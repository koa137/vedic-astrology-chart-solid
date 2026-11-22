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

/** One symbol font for every astrological glyph, so they share a design:
 *  Apple Symbols (macOS), Segoe UI Symbol (Windows), then common fallbacks. */
export const GLYPH_FONT =
  '"Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", "Noto Sans Symbols", "DejaVu Sans", sans-serif';

const fits = new Map<string, { size: number; dx: number; dy: number }>();
/** Fit a glyph's ink into a `box`-pixel square, centred on a point: the font
 *  size that makes its larger ink dimension `box`, and the offsets from the
 *  point to draw it at (text-anchor start, alphabetic baseline). Glyphs from
 *  any font then match in size and sit exactly on their point. */
export function glyphFit(
  text: string,
  box: number
): { size: number; dx: number; dy: number } {
  const key = `${text}|${box}`;
  const hit = fits.get(key);
  if (hit) return hit;
  textWidth('', '10px sans-serif'); // creates the canvas context
  let out = { size: box, dx: -box / 2, dy: box / 2 };
  if (measureCtx) {
    measureCtx.font = `100px ${GLYPH_FONT}`;
    const m = measureCtx.measureText(text);
    const left = m.actualBoundingBoxLeft;
    const right = m.actualBoundingBoxRight;
    const up = m.actualBoundingBoxAscent;
    const down = m.actualBoundingBoxDescent;
    const ink = Math.max(left + right, up + down);
    if (ink > 0) {
      const k = box / ink; // per 100px of font size
      out = {
        size: 100 * k,
        dx: (-k * (right - left)) / 2,
        dy: (k * (up - down)) / 2,
      };
    }
  }
  fits.set(key, out);
  return out;
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
