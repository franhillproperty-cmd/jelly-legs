// Colour contrast (Q115, L132): one bright orange, with near-black text on it, never white;
// no text coloured orange; every text pairing at least 4.5:1, in light and dark mode. The
// values are read from public/styles.css, so changing a colour there is checked here.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const css = readFileSync(join(PUBLIC, 'styles.css'), 'utf8');

function tokens(block) {
  const found = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) found[name] = value.trim().toLowerCase();
  return found;
}

const light = tokens(css.match(/:root\s*\{([^}]*)\}/)[1]);
const dark = { ...light, ...tokens(css.match(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/)[1]) };

function luminance(hex) {
  const [r, g, b] = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground, background, minimum, what it is]
const TEXT = 4.5;
const SHAPE = 3; // non-text: control edges (WCAG 1.4.11)
const PAIRS = [
  ['on-orange', 'orange', TEXT, 'text on orange: filled buttons, chosen options, the tick on a ticked day'],
  ['text', 'bg', TEXT, 'body text, links and labels'],
  ['text', 'surface', TEXT, 'text on cards, inputs, notices and the rehearsal box'],
  ['muted', 'bg', TEXT, 'hints and secondary text'],
  ['muted', 'surface', TEXT, 'secondary text on cards'],
  ['quiet', 'bg', TEXT, 'settled and didn\'t-stay steps'],
  ['error', 'bg', TEXT, 'error messages'],
  ['error', 'surface', TEXT, 'error messages on cards'],
  ['input-border', 'bg', SHAPE, 'edges of text boxes, choices and buttons'],
  ['input-border', 'surface', SHAPE, 'edges of text boxes on white'],
  ['text', 'bg', SHAPE, 'the focus outline'],
];

for (const [mode, palette] of [['light', light], ['dark', dark]]) {
  describe(`Colour contrast, ${mode} mode`, () => {
    for (const [fg, bg, min, what] of PAIRS) {
      it(`${what}: ${fg} on ${bg} is at least ${min}:1`, () => {
        const ratio = contrast(palette[fg], palette[bg]);
        assert.ok(ratio >= min, `${palette[fg]} on ${palette[bg]} is ${ratio.toFixed(2)}:1`);
      });
    }
  });
}

describe('The orange (Q115)', () => {
  it('is one bright orange, the same in both modes, with near-black on it', () => {
    assert.equal(light.orange, '#f97316');
    assert.equal(dark.orange, light.orange);
    assert.equal(light['on-orange'], '#1a1a1a');
    assert.equal(dark['on-orange'], light['on-orange']);
    assert.ok(luminance(light.bg) > 0.9, 'light ground is off-white');
    assert.ok(luminance(dark.bg) < 0.01, 'dark ground is near-black');
  });

  it('never colours text: no rule sets color to orange; links are underlined in orange instead', () => {
    assert.equal(css.match(/(?:^|[\s;{])color:\s*var\(--orange\)/g), null);
    assert.match(css, /text-decoration-color:\s*var\(--orange\)/);
  });

  it('nothing white sits on orange, and no other orange is left anywhere in the app', () => {
    assert.equal(css.match(/var\(--(?:accent|bright)[\w-]*\)/g), null);
    for (const file of readdirSync(PUBLIC, { recursive: true }).filter(f => /\.(css|js|html)$/.test(f))) {
      const text = readFileSync(join(PUBLIC, file), 'utf8').toLowerCase();
      for (const old of ['#c2410c', '#ea580c', '#4f6f8f']) assert.ok(!text.includes(old), `${old} in ${file}`);
    }
  });
});
