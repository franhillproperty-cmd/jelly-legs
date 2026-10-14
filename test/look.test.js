// The fonts (L113): Fraunces and Source Sans 3 are served from public/fonts with their
// licences, and nothing on the page comes from any other address. Read from the files
// themselves, so moving or renaming a font without updating the stylesheet fails here.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const FONTS = join(PUBLIC, 'fonts');
const css = readFileSync(join(PUBLIC, 'styles.css'), 'utf8');
const html = readFileSync(join(PUBLIC, 'index.html'), 'utf8');
const server = readFileSync(fileURLToPath(new URL('../server.js', import.meta.url)), 'utf8');

const fontFaces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => m[1]);
const fontUrls = fontFaces.flatMap(block => [...block.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map(m => m[2]));
// A font url is relative to the stylesheet, which is served at /styles.css.
const fromStylesheet = url => new URL(url, 'http://jelly.test/styles.css');
const publicFile = address => join(PUBLIC, decodeURIComponent(address.pathname));

function tags(name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'g'))].map(m =>
    Object.fromEntries([...m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(([, k, v]) => [k, v ?? ''])));
}
const isRelative = url => !/^(?:[a-z][\w+.-]*:|\/\/)/i.test(url);

// The server's table of file types, read from its source (importing it would start it).
const types = Object.fromEntries([...server.match(/const TYPES = \{([^}]*)\}/)[1]
  .matchAll(/'(\.[\w]+)':\s*'([^']+)'/g)].map(([, ext, type]) => [ext, type]));

describe('The fonts in the stylesheet', () => {
  it('three faces: Fraunces, and Source Sans 3 upright and italic, each swapping in when loaded', () => {
    assert.equal(fontFaces.length, 3);
    const family = block => block.match(/font-family:\s*"([^"]+)"/)[1];
    assert.deepEqual(fontFaces.map(family).sort(), ['Fraunces', 'Source Sans 3', 'Source Sans 3']);
    assert.ok(fontFaces.some(b => family(b) === 'Source Sans 3' && /font-style:\s*italic/.test(b)), 'an italic face');
    for (const block of fontFaces) assert.match(block, /font-display:\s*swap/);
  });

  it('every font url points at a WOFF2 file under public/', () => {
    assert.equal(fontUrls.length, fontFaces.length);
    for (const url of fontUrls) {
      assert.ok(isRelative(url) && !url.startsWith('/'), `${url} is relative to the stylesheet`);
      const file = publicFile(fromStylesheet(url));
      assert.ok(file.startsWith(FONTS) && existsSync(file), `${url} exists under public/fonts`);
      assert.equal(readFileSync(file).subarray(0, 4).toString('latin1'), 'wOF2', `${url} is WOFF2`);
    }
  });

  it('every font file in public/fonts is used, so nothing is carried for nothing', () => {
    const used = new Set(fontUrls.map(url => publicFile(fromStylesheet(url))));
    const files = readdirSync(FONTS, { recursive: true }).filter(f => extname(f) === '.woff2');
    assert.ok(files.length >= 3, `only found ${files.length} font files`);
    for (const f of files) assert.ok(used.has(join(FONTS, f)), `${f} has no @font-face`);
  });

  it('the body is in Source Sans 3 and the headings in Fraunces, each with a fallback', () => {
    assert.match(css, /body\s*\{[^}]*font-family:\s*"Source Sans 3",\s*system-ui/);
    assert.match(css, /h1, h2, h3, \.goal[^{]*\{[^}]*font-family:\s*"Fraunces",\s*Georgia, "Times New Roman", serif/);
  });

  it('nothing comes from another address: no http or https url, no @import', () => {
    assert.doesNotMatch(css, /https?:/i);
    assert.doesNotMatch(css, /@import/i);
  });
});

describe('Each font folder carries its licence', () => {
  const folders = readdirSync(FONTS, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);

  it('finds the font folders', () => {
    assert.deepEqual(folders.sort(), ['fraunces', 'source-sans-3']);
  });

  for (const folder of folders) {
    it(`${folder} has a licence file naming the SIL Open Font License`, () => {
      const licences = readdirSync(join(FONTS, folder)).filter(f => ['.txt', '.md'].includes(extname(f)));
      assert.ok(licences.some(f => readFileSync(join(FONTS, folder, f), 'utf8').includes('SIL Open Font License')),
        `no licence in ${folder}`);
    });
  }
});

describe('The page (index.html)', () => {
  it('every link and script uses a relative url', () => {
    const refs = [...tags('link').map(t => t.href), ...tags('script').map(t => t.src)];
    assert.ok(refs.length >= 4, `only found ${refs.length}`);
    for (const ref of refs) assert.ok(ref && isRelative(ref), `${ref} is relative`);
  });

  it('preloads the body font and the heading font, each a file the stylesheet uses', () => {
    const preloads = tags('link').filter(t => t.rel === 'preload');
    assert.equal(preloads.length, 2);
    const used = new Set(fontUrls.map(url => fromStylesheet(url).pathname));
    for (const p of preloads) {
      // Fonts are fetched without credentials, so a preload without crossorigin is wasted.
      assert.deepEqual([p.as, p.type, 'crossorigin' in p], ['font', 'font/woff2', true], p.href);
      const address = new URL(p.href, 'http://jelly.test/');
      assert.ok(existsSync(publicFile(address)), `${p.href} exists`);
      assert.ok(used.has(address.pathname), `${p.href} is the same file the stylesheet asks for`);
    }
    assert.ok(preloads.some(p => /SourceSans3VF-Upright/.test(p.href)), 'the body font');
    assert.ok(preloads.some(p => /fraunces/.test(p.href)), 'the heading font');
  });
});

describe('The server', () => {
  it('serves the fonts as font/woff2 and their licences as text', () => {
    assert.equal(types['.woff2'], 'font/woff2');
    assert.equal(types['.txt'], 'text/plain; charset=utf-8');
    assert.equal(types['.md'], 'text/markdown; charset=utf-8');
    for (const f of readdirSync(FONTS, { recursive: true }).filter(f => extname(f))) {
      assert.ok(types[extname(f)], `${f} has a type`);
    }
  });

  it('the not-found page, at any depth, loads the stylesheet from the root, so its fonts resolve to /fonts/', () => {
    assert.match(server, /<link rel="stylesheet" href="\/styles\.css">/);
    const sheet = new URL('/styles.css', 'http://jelly.test/no/such/page');
    for (const url of fontUrls) assert.match(new URL(url, sheet).pathname, /^\/fonts\//);
  });
});
