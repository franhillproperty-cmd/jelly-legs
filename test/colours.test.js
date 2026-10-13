// Colour contrast (Q115, L132): every colour pairing the app uses for text meets 4.5:1, in
// light and dark mode. The values are read from public/styles.css, so changing a colour
// there is checked here.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');

function tokens(block) {
  const found = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) found[name] = value.trim();
  for (const [name, value] of Object.entries(found)) {
    const ref = value.match(/^var\(--([\w-]+)\)$/);
    if (ref) found[name] = found[ref[1]];
  }
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
const SHAPE = 3; // non-text: control borders, a tick on a shape (WCAG 1.4.11)
const PAIRS = [
  ['text', 'bg', TEXT, 'body text'],
  ['text', 'surface', TEXT, 'text on cards and inputs'],
  ['text', 'accent-soft', TEXT, 'text in the rehearsal box and notices'],
  ['muted', 'bg', TEXT, 'hints and secondary text'],
  ['muted', 'surface', TEXT, 'secondary text on cards'],
  ['muted', 'accent-soft', TEXT, 'the answers line in the rehearsal box'],
  ['accent', 'bg', TEXT, 'deep orange links and button edges on the ground'],
  ['accent', 'surface', TEXT, 'deep orange on cards and outline buttons'],
  ['accent', 'accent-soft', TEXT, 'links in the rehearsal box'],
  ['accent-ink', 'accent', TEXT, 'text on filled buttons and chosen options'],
  ['quiet', 'bg', TEXT, 'settled and didn\'t-stay steps'],
  ['error', 'bg', TEXT, 'error messages'],
  ['error', 'surface', TEXT, 'error messages on cards'],
  ['input-border', 'bg', SHAPE, 'text box and choice edges'],
  ['input-border', 'surface', SHAPE, 'text box edges on white'],
  ['bright-ink', 'bright', SHAPE, 'the tick on a ticked day'],
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

describe('The palette Q115 asks for', () => {
  it('deep orange for text, bright orange for shapes, off-white and near-black grounds', () => {
    assert.equal(light.accent.toLowerCase(), '#c2410c');
    assert.equal(light.bright.toLowerCase(), '#f97316');
    assert.ok(luminance(light.bg) > 0.9, 'light ground is off-white');
    assert.ok(luminance(dark.bg) < 0.01, 'dark ground is near-black');
  });
});
