// Tiny static preview server for dist/ — plain Node.js, no Python, no dependencies. Works on Windows/macOS/Linux.
// Starts at port 4173 (or $PORT) and automatically moves to the next free port if it is busy.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Always serve <project>/dist, no matter which folder the command is run from.
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
if (!existsSync(path.join(root, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/** Map a URL path to a file inside `base`, or null if it would escape it (handles both / and \ separators). */
function safeResolve(base, urlPath, p = path) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const file = p.resolve(base, decoded.replace(/^[/\\]+/, ''));
  const rel = p.relative(base, file);
  if (rel === '') return file;
  if (rel === '..' || rel.startsWith('..' + p.sep) || p.isAbsolute(rel)) return null;
  return file;
}

const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { allow: 'GET, HEAD' }).end();
      return;
    }
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file = safeResolve(root, url.pathname);
    if (!file) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' }).end('Forbidden');
      return;
    }
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file).catch(() => null);
    if (!body) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': types[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'content-length': body.length,
      'cache-control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500).end('Server error');
  }
});

// Loopback only: no Windows firewall prompt, and nothing exposed to the network.
const HOST = '127.0.0.1';
let port = Number(process.env.PORT) || 4173;
let retries = 50;

server.on('listening', () => {
  const p = server.address().port;
  console.log('');
  console.log('  GLOW BEACH ARENA — preview running');
  console.log(`  PREVIEW_URL=http://localhost:${p}/`);
  console.log('  (press Ctrl+C to stop)');
  console.log('');
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && retries-- > 0) {
    console.log(`Port ${port} is in use, trying ${port + 1}…`);
    server.listen(++port, HOST);
  } else {
    console.error(err);
    process.exit(1);
  }
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
server.listen(port, HOST);
