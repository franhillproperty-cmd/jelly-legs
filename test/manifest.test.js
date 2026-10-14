// The home-screen app (stage 3): the manifest (Q117), the icon (Q115, Q116) and the tags in
// index.html that point phones at them.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeIcons, ICONS, BARS } from '../scripts/make-icons.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const manifest = JSON.parse(readFileSync(join(PUBLIC, 'manifest.webmanifest'), 'utf8'));
const html = readFileSync(join(PUBLIC, 'index.html'), 'utf8');
const css = readFileSync(join(PUBLIC, 'styles.css'), 'utf8');

// A PNG's width, height and colour type, from its header.
function png(bytes) {
  assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), colourType: bytes[25] };
}

// The colour of each pixel of one of the icons: make-icons.mjs writes 8-bit RGB rows, each
// starting with filter byte 0, so the image data only needs inflating.
function pixels(bytes) {
  const { width, height } = png(bytes);
  const data = [];
  for (let at = 8; at < bytes.length;) {
    const length = bytes.readUInt32BE(at);
    if (bytes.subarray(at + 4, at + 8).toString('ascii') === 'IDAT') data.push(bytes.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(data));
  const row = 1 + width * 3;
  assert.equal(raw.length, row * height);
  return {
    width,
    height,
    colour: (x, y) => {
      assert.equal(raw[y * row], 0, 'filter byte');
      const i = y * row + 1 + x * 3;
      return [raw[i], raw[i + 1], raw[i + 2]];
    },
  };
}

describe('The manifest (Q117)', () => {
  it('Jelly Legs, opening like an app, any way up, in British English', () => {
    assert.equal(manifest.name, 'Jelly Legs');
    assert.equal(manifest.short_name, 'Jelly Legs');
    assert.ok(manifest.short_name.length <= 12, 'phones cut labels after about twelve characters (L245)');
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.orientation, 'any');
    assert.equal(manifest.lang, 'en-GB');
  });

  it('its description is PLAN.md line 5, word for word', () => {
    const line5 = readFileSync(join(ROOT, 'PLAN.md'), 'utf8').split(/\r?\n/)[4];
    assert.equal(manifest.description, line5);
  });

  it('opens at the app\'s own address, and its id never changes', () => {
    assert.deepEqual([manifest.id, manifest.start_url, manifest.scope], ['/', '/', '/']);
  });

  it('its colours are the light ground (Q137)', () => {
    const bg = css.match(/:root\s*\{[^}]*--bg:\s*(#[0-9a-f]{6})/i)[1].toLowerCase();
    assert.equal(manifest.theme_color, bg);
    assert.equal(manifest.background_color, bg);
  });

  it('its icons exist and are the size they say: 192 and 512, and a 512 for Android to crop', () => {
    assert.deepEqual(manifest.icons.map(i => [i.sizes, i.purpose ?? 'any']), [['192x192', 'any'], ['512x512', 'any'], ['512x512', 'maskable']]);
    for (const icon of manifest.icons) {
      const file = join(PUBLIC, icon.src);
      assert.ok(existsSync(file), icon.src);
      const { width, height } = png(readFileSync(file));
      assert.equal(`${width}x${height}`, icon.sizes, icon.src);
      assert.equal(icon.type, 'image/png');
    }
  });
});

describe('The icon: a ladder in the bright orange on white (Q115, Q116)', () => {
  it('the files in public/ are exactly what scripts/make-icons.mjs makes', () => {
    for (const [name, bytes] of Object.entries(makeIcons())) {
      assert.ok(readFileSync(join(PUBLIC, name)).equals(bytes), `${name}: run node scripts/make-icons.mjs`);
    }
  });

  it('every PNG is solid (no see-through pixels, which an iPhone would fill black) and square', () => {
    for (const { name, size } of ICONS) {
      const info = png(readFileSync(join(PUBLIC, name)));
      assert.deepEqual([info.width, info.height, info.colourType], [size, size, 2], name);
    }
  });

  it('the orange is the app\'s one orange, and the ground is white', () => {
    const svg = readFileSync(join(PUBLIC, 'icons/icon.svg'), 'utf8');
    assert.match(svg, /stroke="#f97316"/);
    assert.match(svg, /fill="#ffffff"/);
    assert.doesNotMatch(svg, /<text|<title/);
  });

  it('the maskable PNG itself: every pixel that isn\'t white lies inside the circle Android never crops', () => {
    const image = pixels(readFileSync(join(PUBLIC, 'icons/icon-maskable-512.png')));
    const middle = image.width / 2;
    let furthest = 0;
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        if (image.colour(x, y).some(c => c !== 255)) furthest = Math.max(furthest, Math.hypot(x + 0.5 - middle, y + 0.5 - middle));
      }
    }
    assert.ok(furthest <= 0.4 * image.width, `the ladder reaches ${(furthest / image.width).toFixed(3)} of the width from the middle`);
    assert.ok(furthest >= 0.3 * image.width, 'the ladder fills the safe circle');
  });

  it('the maskable icon\'s ladder stays inside the middle circle that Android never crops', () => {
    const { scale } = ICONS.find(i => i.name.includes('maskable'));
    for (const [x1, y1, x2, y2, width] of BARS) {
      for (const [x, y] of [[x1, y1], [x2, y2]]) {
        const reach = Math.hypot(x - 50, y - 50) * scale + (width / 2) * scale;
        assert.ok(reach <= 40, `a bar end reaches ${reach.toFixed(1)} of 40`);
      }
    }
  });
});

describe('index.html points phones at the manifest and the icons', () => {
  const link = rel => html.match(new RegExp(`<link rel="${rel}"[^>]*href="([^"]+)"`))?.[1];

  it('the manifest, the tab\'s icon and the iPhone\'s icon, all from the app itself', () => {
    assert.equal(link('manifest'), 'manifest.webmanifest');
    assert.equal(link('icon'), 'icons/icon.svg');
    assert.equal(link('apple-touch-icon'), 'apple-touch-icon.png');
    for (const href of [link('manifest'), link('icon'), link('apple-touch-icon')]) assert.ok(existsSync(join(PUBLIC, href)), href);
  });

  it('the iPhone\'s label is Jelly Legs too', () => {
    assert.match(html, /<meta name="apple-mobile-web-app-title" content="Jelly Legs">/);
    assert.match(html, /<title>Jelly Legs<\/title>/);
  });
});

describe('Railway (stage 3)', () => {
  it('runs node server.js directly, on Node 24, with no dependencies', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    assert.equal(pkg.engines.node, '24.x');
    assert.equal(pkg.dependencies, undefined);
    assert.equal(pkg.devDependencies, undefined);
    const railpack = JSON.parse(readFileSync(join(ROOT, 'railpack.json'), 'utf8'));
    assert.equal(railpack.deploy.startCommand, 'node server.js');
  });
});
