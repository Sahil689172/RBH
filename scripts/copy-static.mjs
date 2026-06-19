import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const dirs = ['brands', 'collection', 'public2', 'public3', 'homepage_frames'];
const files = [
  'style.css',
  'mobile.css',
  'hero-mobile.css',
  'site.js',
  'landing.js',
  'about.js',
  'collection.js',
  'contact.js',
  'favicon.svg',
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if (!fs.existsSync(dist)) {
  console.error('dist/ not found — run vite build first');
  process.exit(1);
}

for (const dir of dirs) {
  copyDir(path.join(root, dir), path.join(dist, dir));
}

for (const file of files) {
  copyFile(path.join(root, file), path.join(dist, file));
}

for (const asset of ['i3.png', 'i4.png', 'loader.mp4', 'contact.mp4']) {
  const fromPublic = path.join(root, 'public', asset);
  const fromRoot = path.join(root, asset);
  const fromLoader = path.join(root, 'Loader.mp4');
  const src =
    asset === 'loader.mp4'
      ? [fromPublic, fromRoot, fromLoader].find((p) => fs.existsSync(p))
      : fs.existsSync(fromPublic)
        ? fromPublic
        : fromRoot;
  if (src) copyFile(src, path.join(dist, asset));
}

console.log('Static pages and assets copied to dist/');
