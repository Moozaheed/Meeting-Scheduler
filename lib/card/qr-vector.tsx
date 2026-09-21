import { QRCodeSVG } from 'qrcode.react';
import { renderToStaticMarkup } from 'react-dom/server';

/** Vector path data for a QR code, derived from qrcode.react's own public component. */
export interface QrVectorData {
  /** The SVG viewBox is `0 0 numCells numCells` (a square coordinate space). */
  numCells: number;
  /** Path `d` data for the dark (foreground) QR modules only — the light background is omitted since the PDF page is already white. */
  modulesPathData: string;
}

const FOREGROUND_COLOR = '#000000';
const BACKGROUND_COLOR = '#FFFFFF';

/**
 * Derives vector path data for a QR code encoding `value`, using
 * qrcode.react's own public `QRCodeSVG` component (tech-stack-decisions.md
 * locks qrcode.react as the QR library — this never bypasses it or
 * reimplements QR encoding).
 *
 * `@react-pdf/renderer` cannot mount a real DOM `<svg>` element (it uses
 * its own PDF-primitive reconciler), so the live DOM preview and the PDF
 * export cannot literally share one rendered component instance. Instead,
 * this parses the `<path d="…">` that `QRCodeSVG` already produces from
 * its real, public render output and hands that same path data to
 * `@react-pdf/renderer`'s own `<Svg>/<Path>` primitives — so both surfaces
 * draw the identical module geometry for the identical payload, per
 * tech-stack-decisions.md's "one consistent rendering model", without
 * adding a second QR-generation library.
 */
export function getQrVectorData(value: string): QrVectorData {
  const markup = renderToStaticMarkup(
    <QRCodeSVG value={value} bgColor={BACKGROUND_COLOR} fgColor={FOREGROUND_COLOR} includeMargin />,
  );

  const viewBoxMatch = markup.match(/viewBox="0 0 (\d+) \d+"/);
  const numCells = viewBoxMatch ? Number(viewBoxMatch[1]) : 0;

  const pathTags = [...markup.matchAll(/<path\b([^>]*)\/>/g)];
  let modulesPathData = '';
  for (const [, attrs] of pathTags) {
    const fillMatch = attrs.match(/fill="([^"]*)"/i);
    const dMatch = attrs.match(/\bd="([^"]*)"/);
    if (fillMatch?.[1]?.toLowerCase() === FOREGROUND_COLOR.toLowerCase() && dMatch) {
      modulesPathData = dMatch[1];
      break;
    }
  }

  return { numCells, modulesPathData };
}
