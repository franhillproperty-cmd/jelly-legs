// Every file the app refers to exists, spelled exactly as it is on disk. Windows (where the
// app is built) ignores the case of a file's name and Railway's Linux doesn't, so a
// wrong-case reference would work here and break once deployed: a module that doesn't load
// is a blank app, and a missing icon breaks the home-screen install.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PUBLIC = join(ROOT, 'public');

// True when every part of the path, from public/ down, is a name in its folder exactly.
function existsExactly(file) {
  const parts = relative(PUBLIC, file).split(sep);
  if (parts[0] === '..') return false;
  let folder = PUBLIC;
  for (const part of parts) {
    let names;
    try {
      names = readdirSync(folder);
    } catch {
      return false;
    }
    if (!names.includes(part)) return false;
    folder = join(folder, part);
  }
  return true;
}

// The references in one file: [address, the file it is relative to].
function referencesIn(file, text) {
  const found = [];
  if (file.endsWith('.js')) {
    for (const m of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g)) found.push(m[1]);
  } else if (file.endsWith('.css')) {
    for (const m of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) found.push(m[1]);
  } else if (file.endsWith('.html')) {
    for (const m of text.matchAll(/\s(?:href|src)="([^"]+)"/g)) found.push(m[1]);
  } else if (file.endsWith('.webmanifest')) {
    for (const icon of JSON.parse(text).icons) found.push(icon.src);
  }
  return found;
}

const files = readdirSync(PUBLIC, { recursive: true })
  .filter(f => /\.(js|css|html|webmanifest)$/.test(f))
  .map(f => join(PUBLIC, f));

describe('Every file the app refers to exists, spelled exactly', () => {
  it('scans the app\'s pages, scripts, stylesheet and manifest', () => {
    assert.ok(files.length >= 15, `only ${files.length} files`);
  });

  for (const file of files) {
    it(relative(PUBLIC, file), () => {
      for (const address of referencesIn(file, readFileSync(file, 'utf8'))) {
        if (/^[a-z]+:/i.test(address) || address.startsWith('#')) continue; // outside links, and the app's own screens
        const target = address.startsWith('/') ? join(PUBLIC, address) : join(dirname(file), address);
        assert.ok(existsExactly(target), `${address}`);
      }
    });
  }

  it('the not-found page in server.js', () => {
    const page = readFileSync(join(ROOT, 'server.js'), 'utf8').match(/const notFoundPage = `([\s\S]*?)`;/)[1];
    const addresses = [...page.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(m => m[1]).filter(a => a !== '/');
    assert.ok(addresses.length >= 2);
    for (const address of addresses) assert.ok(existsExactly(join(PUBLIC, address)), address);
  });

  it('the check itself catches a wrong-case name', () => {
    assert.equal(existsExactly(join(PUBLIC, 'app.js')), true);
    assert.equal(existsExactly(join(PUBLIC, 'App.js')), false);
    assert.equal(existsExactly(join(PUBLIC, 'Icons', 'icon.svg')), false);
    assert.equal(existsExactly(join(PUBLIC, '..', 'server.js')), false);
  });
});
