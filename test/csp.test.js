// The security policy (server.js, Q113) lets nothing inline run or style the page. This
// checks, file by file, that the app never relies on anything it would block, so a change
// that would break on the phone fails here first.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const scripts = readdirSync(PUBLIC, { recursive: true }).filter(f => f.endsWith('.js')).map(f => [f, readFileSync(join(PUBLIC, f), 'utf8')]);
const pages = [
  ['public/index.html', readFileSync(join(PUBLIC, 'index.html'), 'utf8')],
  ['the not-found page in server.js', readFileSync(join(ROOT, 'server.js'), 'utf8').match(/const notFoundPage = `([\s\S]*?)`;/)[1]],
];

describe('Nothing the security policy would block', () => {
  it('the pages: every script is a file, no style block, no style attribute, no data: address', () => {
    for (const [name, page] of pages) {
      for (const tag of page.match(/<script\b[^>]*>/g) ?? []) assert.match(tag, /\ssrc="/, `${name}: ${tag}`);
      assert.doesNotMatch(page, /<style\b/, name);
      assert.doesNotMatch(page, /\sstyle=/, name);
      assert.doesNotMatch(page, /\son[a-z]+=/i, `${name}: an inline event handler`);
      assert.doesNotMatch(page, /data:/, name);
      assert.doesNotMatch(page, /https?:\/\//, `${name}: something from another address`);
    }
  });

  it('the stylesheet: no @import, and every url() a file of the app', () => {
    const css = readFileSync(join(PUBLIC, 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(css, /@import\b/);
    const urls = [...css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)].map(m => m[2]);
    assert.ok(urls.length >= 3, 'the three fonts');
    for (const url of urls) assert.doesNotMatch(url, /^([a-z][a-z0-9+.-]*:|\/\/)/i, `styles.css: url(${url})`);
  });

  it('the scripts: no HTML written as text, no style attribute, no code made from text', () => {
    const banned = [
      [/\.innerHTML\s*=/, 'innerHTML'],
      [/\.outerHTML\s*=/, 'outerHTML'],
      [/insertAdjacentHTML/, 'insertAdjacentHTML'],
      [/document\.write/, 'document.write'],
      [/setAttribute\(\s*['"]style['"]/, "setAttribute('style')"],
      [/\.cssText\b/, 'cssText'],
      [/insertRule/, 'insertRule'],
      [/commitStyles/, 'commitStyles'],
      [/\beval\s*\(/, 'eval'],
      [/new Function\b/, 'new Function'],
      [/[{,]\s*style:\s*['"`]/, 'a style given as text to h()'],
      [/import\(\s*['"`]https?:/, 'a script from another address'],
      [/\.src\s*=\s*['"`](data|blob|https?):/, 'an image or script from a data:, blob: or outside address'],
    ];
    for (const [file, text] of scripts) {
      for (const [pattern, what] of banned) assert.doesNotMatch(text, pattern, `${file}: ${what}`);
    }
  });
});
