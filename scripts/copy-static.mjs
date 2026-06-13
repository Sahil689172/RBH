import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const dirs = ['about', 'brands', 'collection', 'contact', 'public2', 'public3'];
const files = [
  'style.css',
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

for (const image of ['i3.png', 'i4.png']) {
  const fromPublic = path.join(root, 'public', image);
  const fromRoot = path.join(root, image);
  const src = fs.existsSync(fromPublic) ? fromPublic : fromRoot;
  copyFile(src, path.join(dist, image));
}

console.log('Static pages and assets copied to dist/');
