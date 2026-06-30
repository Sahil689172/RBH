import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(root, 'public', 'leather-shoes-catalog.json');
const DEST_DIR = path.join(root, 'Leather Shoes');

const SOURCE_CANDIDATES = [
  path.join(root, 'Leather Shoes'),
  path.join(root, 'leather shoes'),
  path.join(root, '..', 'leather shoes'),
  path.join(root, '..', 'Leather Shoes'),
];

const FOLDER_PATTERN = /^s(\d+)\s+(\d+)$/i;
const IMAGE_PATTERN = /^a(\d+)\.(jpe?g|png|webp)$/i;

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function resolveSourceDir() {
  for (const candidate of SOURCE_CANDIDATES) {
    if (!fs.existsSync(candidate)) continue;
    try {
      const entries = fs.readdirSync(candidate, { withFileTypes: true });
      const hasProduct = entries.some((entry) => {
        if (!entry.isDirectory()) return false;
        return FOLDER_PATTERN.test(entry.name.trim());
      });
      if (hasProduct) return candidate;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function syncSourceToDest(source) {
  if (!source) return false;
  const normalizedSource = path.resolve(source);
  const normalizedDest = path.resolve(DEST_DIR);

  if (normalizedSource === normalizedDest) {
    return fs.existsSync(normalizedDest);
  }

  if (fs.existsSync(normalizedDest)) {
    fs.rmSync(normalizedDest, { recursive: true, force: true });
  }

  copyDir(normalizedSource, normalizedDest);
  return true;
}

function toPublicUrl(folderName, fileName) {
  return `/${['Leather Shoes', folderName, fileName].map(encodeURIComponent).join('/')}`;
}

function readImages(folderPath) {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  const images = [];

  for (const entry of files) {
    if (!entry.isFile()) continue;
    const match = entry.name.match(IMAGE_PATTERN);
    if (!match) continue;
    images.push({
      index: Number.parseInt(match[1], 10),
      file: entry.name,
    });
  }

  images.sort((a, b) => a.index - b.index);
  return images.map((item) => item.file);
}

function buildCatalog(catalogRoot) {
  const products = [];

  for (const entry of fs.readdirSync(catalogRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const folderName = entry.name.trim();
    const match = folderName.match(FOLDER_PATTERN);
    if (!match) continue;

    const folderPath = path.join(catalogRoot, folderName);
    const imageFiles = readImages(folderPath);
    if (imageFiles.length === 0) continue;

    const thumbnailFile =
      imageFiles.find((file) => /^a1\./i.test(file)) ?? imageFiles[0];

    const images = imageFiles.map((file) => toPublicUrl(folderName, file));

    products.push({
      id: `s${match[1]}`,
      folder: folderName,
      price: Number.parseInt(match[2], 10),
      thumbnail: toPublicUrl(folderName, thumbnailFile),
      images,
    });
  }

  products.sort((a, b) => {
    const numA = Number.parseInt(a.id.replace(/^s/i, ''), 10);
    const numB = Number.parseInt(b.id.replace(/^s/i, ''), 10);
    return numA - numB;
  });

  return products;
}

function main() {
  const source = resolveSourceDir();
  const synced = syncSourceToDest(source);
  const catalogRoot = synced && fs.existsSync(DEST_DIR) ? DEST_DIR : null;
  const products = catalogRoot ? buildCatalog(catalogRoot) : [];

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: source ?? null,
        products,
      },
      null,
      2,
    ),
  );

  console.log(
    products.length > 0
      ? `Leather catalog: ${products.length} products → public/leather-shoes-catalog.json`
      : 'Leather catalog: no product folders found (add folders under Leather Shoes/)',
  );
}

main();
