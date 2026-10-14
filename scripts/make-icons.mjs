// The home-screen icon (Q115, Q116): a plain ladder in the one bright orange on white,
// drawn here as a few round-ended bars and written as PNG files (and one SVG) for the
// manifest and the page. No packages: the PNG encoder uses Node's own zlib.
//
//   node scripts/make-icons.mjs        writes the files into public/
//
// The drawing is a placeholder for Fran to replace (GAPS.md). test/manifest.test.js checks
// that the files in public/ are exactly what this script makes, so change the drawing here
// and run the script again, rather than editing the PNGs.

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ORANGE = [0xf9, 0x73, 0x16]; // #F97316, the app's one orange (Q115)
const WHITE = [0xff, 0xff, 0xff];

// The ladder on a 100 x 100 grid: two rails leaning to the right, like the ladder in the
// Ladder's scene, and five rungs. Each bar is a line with round ends: [x1, y1, x2, y2, width].
const RAIL_WIDTH = 7;
const RUNG_WIDTH = 6;
const LEFT = [30, 88, 52, 12];
const RIGHT = [52, 88, 74, 12];
const RUNG_YS = [24, 37, 50, 63, 76];
const along = ([x1, y1, x2, y2], y) => x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
export const BARS = [
  [...LEFT, RAIL_WIDTH],
  [...RIGHT, RAIL_WIDTH],
  ...RUNG_YS.map(y => [along(LEFT, y), y, along(RIGHT, y), y, RUNG_WIDTH]),
];

// The files, by their place in public/: the size in pixels and how much of the square the
// ladder may use. A maskable icon is cut to a circle or a rounded square by Android, so its
// ladder stays inside the middle 80% (the safe zone). The iPhone's icon sits at the top of
// public/, where iPhones also look for it unasked. Browser tabs use the SVG.
export const ICONS = [
  { name: 'apple-touch-icon.png', size: 180, scale: 1 },
  { name: 'icons/icon-192.png', size: 192, scale: 1 },
  { name: 'icons/icon-512.png', size: 512, scale: 1 },
  { name: 'icons/icon-maskable-512.png', size: 512, scale: 0.78 },
];

// The distance from (px, py) to the bar from (x1, y1) to (x2, y2).
function distance(px, py, [x1, y1, x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// One pixel's share of orange, from 4 x 4 samples, so the edges are smooth.
function coverage(x, y, size, scale) {
  const SAMPLES = 4;
  let inside = 0;
  for (let sy = 0; sy < SAMPLES; sy += 1) {
    for (let sx = 0; sx < SAMPLES; sx += 1) {
      // The sample's place on the 100 x 100 grid, scaled about the middle.
      const gx = 50 + (((x + (sx + 0.5) / SAMPLES) / size) * 100 - 50) / scale;
      const gy = 50 + (((y + (sy + 0.5) / SAMPLES) / size) * 100 - 50) / scale;
      if (BARS.some(bar => distance(gx, gy, bar) <= bar[4] / 2)) inside += 1;
    }
  }
  return inside / (SAMPLES * SAMPLES);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

// A square PNG of the ladder: 8-bit RGB, no transparency (iPhone fills transparency black).
export function drawIcon(size, scale) {
  const rows = [];
  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 3); // filter byte 0, then RGB
    for (let x = 0; x < size; x += 1) {
      const c = coverage(x, y, size, scale);
      for (let i = 0; i < 3; i += 1) row[1 + x * 3 + i] = Math.round(WHITE[i] + (ORANGE[i] - WHITE[i]) * c);
    }
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// The same ladder as an SVG, for browsers that take one as the tab's icon.
export function iconSvg() {
  const r = n => Math.round(n * 100) / 100;
  const lines = BARS.map(([x1, y1, x2, y2, w]) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke-width="${w}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ffffff"/><g stroke="#f97316" stroke-linecap="round">${lines.join('')}</g></svg>\n`;
}

export function makeIcons() {
  const files = Object.fromEntries(ICONS.map(({ name, size, scale }) => [name, drawIcon(size, scale)]));
  files['icons/icon.svg'] = Buffer.from(iconSvg());
  return files;
}

if (import.meta.main) {
  const dir = fileURLToPath(new URL('../public/', import.meta.url));
  mkdirSync(`${dir}icons`, { recursive: true });
  for (const [name, bytes] of Object.entries(makeIcons())) {
    writeFileSync(dir + name, bytes);
    console.log(`public/${name}`);
  }
}
