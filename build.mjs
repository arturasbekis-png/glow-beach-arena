// Production build: esbuild bundles TS + CSS, then copies index.html and public/ into dist/.
// Uses esbuild's JavaScript API (not a spawned binary) so it behaves the same on Windows, macOS and Linux.
import { createRequire } from 'node:module';
import { rmSync, mkdirSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const require = createRequire(import.meta.url);

const loadEsbuild = () => {
  // Normal case: `npm install` put esbuild in ./node_modules. The extra paths are optional fallbacks.
  const roots = [process.cwd(), process.env.ESBUILD_DIR, '/opt/npm-tools'].filter(Boolean);
  for (const root of roots) {
    try {
      return require(require.resolve('esbuild', { paths: [root] }));
    } catch {
      /* try next */
    }
  }
  console.error('esbuild was not found. Run `npm install` in the project folder first.');
  process.exit(1);
};
const esbuild = loadEsbuild();

rmSync('dist', { recursive: true, force: true });
mkdirSync(join('dist', 'assets'), { recursive: true });

// Which optional assets (logo, photos, game build, hero media) are present? The app only requests those.
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : [relative('public', p).split(sep).join('/')];
      })
    : [];
const publicFiles = walk('public').filter((f) => !f.endsWith('.md'));

esbuild.buildSync({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  outfile: 'dist/assets/main.js',
  define: { __PUBLIC_FILES__: JSON.stringify(JSON.stringify(publicFiles)) },
  logLevel: 'warning',
});
esbuild.buildSync({
  entryPoints: ['src/styles/main.css'],
  bundle: true,
  minify: true,
  outfile: 'dist/assets/main.css',
  logLevel: 'warning',
});

cpSync('index.html', join('dist', 'index.html'));
if (existsSync('public')) cpSync('public', 'dist', { recursive: true, filter: (src) => !src.endsWith('.md') });

console.log('Build complete → dist/');
