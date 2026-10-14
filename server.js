// Serves the app's files from public/ and nothing else: no database, no accounts, no
// personal data (L113, L134). Zero dependencies; the port comes from PORT, which Railway
// sets, and is 3000 on a laptop (Q113).
//
// - Every response carries strict security headers: nothing may load from anywhere else,
//   the app can't be framed, and the browser features it doesn't use are switched off.
// - Phones always check for a newer file (no-cache), and a file that hasn't changed is
//   answered "not modified", so a fix arrives straight away and the fonts aren't fetched
//   again on every visit.
// - Anything that isn't one of the app's files gets the placeholder "page not found".
// - Only the start-up line is logged: nothing about any request or any person.
// - Railway sends SIGTERM before replacing a deployment; the server stops taking requests
//   and exits once the ones in hand are sent, given Railway's draining time (README).
// - No redirect to https: Railway's edge only serves https and passes plain http on to
//   here, so a redirect would loop, and it would break testing over the wifi (Q111).

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { NOT_FOUND, APP_NAME } from './public/strings.js';

const ROOT = fileURLToPath(new URL('./public/', import.meta.url));

export const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  // The fonts in public/fonts, and the licences that travel with them.
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

// The same on every response, the "page not found" and the refusals included. The page
// has no inline script or style, so nothing needs 'unsafe-inline'. Export's share sheet
// on an iPhone home-screen app needs Web Share, so it isn't switched off.
export const SECURITY = {
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'accelerometer=(), autoplay=(), bluetooth=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), usb=(), xr-spatial-tracking=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000',
};

// The stylesheet's address is absolute so this page is styled at any depth; the fonts'
// addresses in it are relative to the stylesheet, so they resolve to /fonts/ here too.
const notFoundPage = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${APP_NAME}</title>
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css"></head><body><div id="app"><main>
<h1>${NOT_FOUND.text}</h1><p><a href="/">${NOT_FOUND.link}</a></p></main></div></body></html>`;

// Which file in public/ an address means, or null for anything else: an address that
// can't be read, reaches outside public/, names a folder or a hidden file, or has an
// ending this server doesn't serve.
async function fileFor(url) {
  let path;
  try {
    // Only the path: an address starting // must not be read as another host's (//x/y).
    path = decodeURIComponent(new URL(url.startsWith('/') ? `http://localhost${url}` : url).pathname);
  } catch {
    return null;
  }
  if (path.includes('\0')) return null;
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT) || file.slice(ROOT.length).split(sep).some(part => part.startsWith('.'))) return null;
  if (!Object.hasOwn(TYPES, extname(file))) return null;
  try {
    const info = await stat(file);
    return info.isFile() ? { file, info } : null;
  } catch {
    return null;
  }
}

export async function handle(req, res) {
  for (const [name, value] of Object.entries(SECURITY)) res.setHeader(name, value);
  const head = req.method === 'HEAD';
  if (req.method !== 'GET' && !head) {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Length': 0 });
    res.end();
    return;
  }
  const found = await fileFor(req.url);
  if (!found) {
    const body = Buffer.from(notFoundPage);
    res.writeHead(404, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache', 'Content-Length': body.length });
    res.end(head ? undefined : body);
    return;
  }
  // A weak tag from the file's size and time is enough to tell a changed file (Q113).
  const etag = `W/"${found.info.size.toString(16)}-${Math.floor(found.info.mtimeMs).toString(16)}"`;
  const headers = { 'Content-Type': TYPES[extname(found.file)], 'Cache-Control': 'no-cache', ETag: etag };
  if (req.headers['if-none-match']?.split(',').some(tag => tag.trim() === etag)) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  let body;
  try {
    body = await readFile(found.file);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': 0 });
    res.end();
    return;
  }
  res.writeHead(200, { ...headers, 'Content-Length': body.length });
  res.end(head ? undefined : body);
}

export function createServer() {
  return http.createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) res.writeHead(500, { 'Content-Length': 0 });
      res.end();
    });
  });
}

// Run directly (node server.js, npm start): listen, say where, and stop cleanly when asked.
// Imported (the tests), it only builds the server.
if (import.meta.main) {
  const PORT = Number(process.env.PORT) || 3000;
  const server = createServer();
  // No host given: Node listens on every address, IPv6 and IPv4, which Railway needs.
  server.listen(PORT, () => {
    const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME);
    const lan = onRailway ? null : Object.values(networkInterfaces()).flat()
      .find(a => a && a.family === 'IPv4' && !a.internal)?.address;
    console.log(`${APP_NAME} on port ${PORT}${lan ? ` (http://localhost:${PORT}, or on a phone on the same wifi: http://${lan}:${PORT})` : ''}`);
  });
  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
