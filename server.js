// Serves the app's files from public/ and nothing else: no database, no accounts, nothing
// about any person (L113, L134). Zero dependencies; the port comes from PORT.
// Stage 2 keeps this minimal so the screens can be tried on a phone over wifi (Q111);
// stage 3 adds the hardening, the manifest and the Railway config.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { NOT_FOUND, APP_NAME } from './public/strings.js';

const ROOT = fileURLToPath(new URL('./public/', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  // The fonts in public/fonts, and the licences that travel with them.
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

// The stylesheet's address is absolute so this page is styled at any depth; the fonts'
// addresses in it are relative to the stylesheet, so they resolve to /fonts/ here too.
const notFoundPage = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${APP_NAME}</title>
<link rel="stylesheet" href="/styles.css"></head><body><div id="app"><main>
<h1>${NOT_FOUND.text}</h1><p><a href="/">${NOT_FOUND.link}</a></p></main></div></body></html>`;

function send(res, status, type, body, head) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(head ? undefined : body);
}

const server = http.createServer(async (req, res) => {
  const head = req.method === 'HEAD';
  if (req.method !== 'GET' && !head) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    send(res, 404, TYPES['.html'], notFoundPage, head);
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(ROOT)) {
    send(res, 404, TYPES['.html'], notFoundPage, head);
    return;
  }
  try {
    send(res, 200, TYPES[extname(file)] ?? 'application/octet-stream', await readFile(file), head);
  } catch {
    send(res, 404, TYPES['.html'], notFoundPage, head);
  }
});

server.listen(PORT, () => {
  const lan = Object.values(networkInterfaces()).flat()
    .find(a => a && a.family === 'IPv4' && !a.internal)?.address;
  console.log(`${APP_NAME} on http://localhost:${PORT}${lan ? ` (on a phone on the same wifi: http://${lan}:${PORT})` : ''}`);
});
