// The hardened server (stage 3, Q113): only public/'s files, strict security headers on
// every response, phones always checking for a newer file, a placeholder "page not found",
// GET and HEAD only. Runs the real server on a free port.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer, SECURITY, TYPES } from '../server.js';
import { NOT_FOUND } from '../public/strings.js';

let server;
let port;

// A request with the path sent exactly as written (fetch would tidy away "../").
function request(path, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method, headers }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Written out here, not read from server.js, so a header dropped or changed there fails here.
const EXPECTED = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin',
  'x-frame-options': 'DENY',
  'strict-transport-security': 'max-age=31536000',
};
const securityHeadersOn = res => {
  for (const [name, value] of Object.entries(EXPECTED)) assert.equal(res.headers[name], value, name);
  assert.equal(res.headers['content-security-policy'], SECURITY['Content-Security-Policy']);
  assert.match(res.headers['content-security-policy'], /^default-src 'none'; /);
  assert.match(res.headers['permissions-policy'], /camera=\(\)/);
  assert.equal(Object.keys(SECURITY).length, 8, 'the eight headers, no more and no fewer');
};

before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(() => new Promise(resolve => server.close(resolve)));

describe('The server serves the app\'s files', () => {
  it('the app at /, with the security headers, no-cache and a tag', async () => {
    const res = await request('/');
    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
    assert.equal(res.headers['cache-control'], 'no-cache');
    assert.match(res.headers.etag, /^W\/"[0-9a-f]+-[0-9a-f]+"$/);
    assert.equal(res.body.toString(), readFileSync(new URL('../public/index.html', import.meta.url), 'utf8'));
    securityHeadersOn(res);
  });

  it('each kind of file with its own type; a question mark and what follows it are ignored', async () => {
    const files = {
      '/index.html': TYPES['.html'],
      '/app.js': TYPES['.js'],
      '/styles.css': TYPES['.css'],
      '/manifest.webmanifest': 'application/manifest+json; charset=utf-8',
      '/apple-touch-icon.png': 'image/png',
      '/icons/icon.svg': 'image/svg+xml',
      '/fonts/fraunces/fraunces-latin-wght-normal.woff2': 'font/woff2',
      '/fonts/fraunces/OFL.txt': 'text/plain; charset=utf-8',
      '/fonts/source-sans-3/LICENSE.md': 'text/markdown; charset=utf-8',
      '/?from=home': TYPES['.html'],
    };
    for (const [path, type] of Object.entries(files)) {
      const res = await request(path);
      assert.equal(res.status, 200, path);
      assert.equal(res.headers['content-type'], type, path);
      assert.equal(Number(res.headers['content-length']), res.body.length, path);
      // Phones always ask for a newer copy, the manifest and the icons included (Q113).
      assert.equal(res.headers['cache-control'], 'no-cache', path);
      assert.ok(res.headers.etag, path);
      securityHeadersOn(res);
    }
  });

  it("an address with a doubled slash is still the app's own file, never another host", async () => {
    const res = await request('//app.js');
    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], TYPES['.js']);
    assert.equal(res.body.toString(), readFileSync(new URL('../public/app.js', import.meta.url), 'utf8'));
    assert.equal((await request('//')).headers['content-type'], TYPES['.html']);
    assert.equal((await request('//package.json')).status, 404);
  });

  it('HEAD: the same headers, no body', async () => {
    const get = await request('/styles.css');
    const head = await request('/styles.css', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    for (const name of ['content-type', 'content-length', 'etag', 'cache-control', 'content-security-policy']) {
      assert.equal(head.headers[name], get.headers[name], name);
    }
  });
});

describe('A file that hasn\'t changed is "not modified" (Q113)', () => {
  it('304 with no body for a matching tag; the file again for any other', async () => {
    const first = await request('/fonts/source-sans-3/SourceSans3VF-Upright.ttf.woff2');
    const again = await request('/fonts/source-sans-3/SourceSans3VF-Upright.ttf.woff2', { headers: { 'If-None-Match': first.headers.etag } });
    assert.equal(again.status, 304);
    assert.equal(again.body.length, 0);
    assert.equal(again.headers.etag, first.headers.etag);
    securityHeadersOn(again);
    const listed = await request('/styles.css', { headers: { 'If-None-Match': `W/"0-0", ${(await request('/styles.css')).headers.etag}` } });
    assert.equal(listed.status, 304);
    const stale = await request('/styles.css', { headers: { 'If-None-Match': 'W/"0-0"' } });
    assert.equal(stale.status, 200);
  });
});

describe('Nothing else is served', () => {
  const notFound = async path => {
    const res = await request(path);
    assert.equal(res.status, 404, path);
    assert.equal(res.headers['content-type'], 'text/html; charset=utf-8', path);
    assert.ok(res.body.toString().includes(NOT_FOUND.text), path);
    securityHeadersOn(res);
  };

  it('an address that isn\'t a file: the placeholder page, with the security headers', async () => {
    await notFound('/nope');
    await notFound('/screens/'); // a folder
    await notFound('/screens');
  });

  it('nothing outside public/, however the address is written', async () => {
    for (const path of ['/../package.json', '/..%2fpackage.json', '/%2e%2e/package.json', '/%2e%2e%2fserver.js', '/icons/../../server.js', '/..\\server.js']) {
      await notFound(path);
    }
  });

  it('no hidden files, no unknown kinds of file, no broken addresses', async () => {
    for (const path of ['/.env', '/icons/.hidden.png', '/index.html%00.png', '/%E0%A4%A', '/rules.js.map', '/index.HTML.bak']) {
      await notFound(path);
    }
  });

  it('only GET and HEAD: anything else is refused, with the security headers', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']) {
      const res = await request('/', { method });
      assert.equal(res.status, 405, method);
      assert.equal(res.headers.allow, 'GET, HEAD', method);
      securityHeadersOn(res);
    }
  });
});

describe('The security policy', () => {
  it('lets nothing load from anywhere else, nothing inline, and nothing frame the app', () => {
    const csp = SECURITY['Content-Security-Policy'];
    assert.match(csp, /default-src 'none'/);
    for (const kind of ['script', 'style', 'img', 'font', 'connect', 'manifest']) assert.match(csp, new RegExp(`${kind}-src 'self'(;|$)`), kind);
    assert.doesNotMatch(csp, /unsafe|https?:|\*|data:|blob:/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.equal(SECURITY['X-Frame-Options'], 'DENY');
  });

  it('leaves Web Share on: Export uses it from an iPhone home-screen app (Q109)', () => {
    assert.doesNotMatch(SECURITY['Permissions-Policy'], /web-share/);
    assert.match(SECURITY['Permissions-Policy'], /camera=\(\)/);
    assert.match(SECURITY['Permissions-Policy'], /microphone=\(\)/);
  });
});

describe('Started as a program', () => {
  // node server (no ending) and npm start both reach server.js; each must listen and say so.
  it('listens and logs only its start-up line; imported, as here, it doesn\'t start', async () => {
    // A port nobody is using: borrow one from the system, then hand it over.
    const free = await new Promise(resolve => {
      const probe = http.createServer().listen(0, '127.0.0.1', () => {
        const { port: p } = probe.address();
        probe.close(() => resolve(p));
      });
    });
    const repo = fileURLToPath(new URL('../', import.meta.url));
    const child = spawn(process.execPath, ['server'], { cwd: repo, env: { ...process.env, PORT: String(free) } });
    let out = '';
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`no start-up line: "${out}"`)), 5000);
        child.stdout.on('data', chunk => {
          out += chunk;
          if (out.includes('\n')) {
            clearTimeout(timer);
            resolve();
          }
        });
        child.on('exit', code => {
          clearTimeout(timer);
          reject(new Error(`exited with ${code}`));
        });
      });
      assert.match(out, new RegExp(`^Jelly Legs on port ${free}\\b`));
      assert.equal(out.trim().split('\n').length, 1);
      const answer = await new Promise((resolve, reject) => {
        http.get({ host: '127.0.0.1', port: free, path: '/' }, res => { res.resume(); resolve(res.statusCode); }).on('error', reject);
      });
      assert.equal(answer, 200);
    } finally {
      child.kill();
    }
  });
});
