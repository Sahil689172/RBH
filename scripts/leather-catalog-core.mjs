import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const SOURCE_CANDIDATES = (root) => [
  path.join(root, '..', 'leather shoes'),
  path.join(root, '..', 'Leather Shoes'),
  path.join(root, 'leather shoes'),
  path.join(root, 'Leather Shoes'),
];

export function isImageFile(name) {
  return /\.(jpe?g|png|webp|jfif)$/i.test(name);
}

export function parseFolderName(rawName) {
  const normalized = rawName.trim().replace(/\s+/g, ' ');
  const match = normalized.match(/^s\s*(\d+)\s+(\d+)$/i);
  if (!match) return null;

  return {
    number: Number.parseInt(match[1], 10),
    price: Number.parseInt(match[2], 10),
    folderName: rawName.trim(),
  };
}

export function toPublicUrl(folderName, fileName) {
  return `/${['Leather Shoes', folderName, fileName].map(encodeURIComponent).join('/')}`;
}

export function readImages(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  const entries = fs.readdirSync(folderPath, { withFileTypes: true }).filter(
    (entry) => entry.isFile() && isImageFile(entry.name),
  );

  const aNamed = [];
  const other = [];

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    const stem = path.parse(entry.name).name.toLowerCase().replace(/\s+/g, '');
    const match = stem.match(/^a(\d+)$/);

    if (match) {
      aNamed.push({
        index: Number.parseInt(match[1], 10),
        file: entry.name,
      });
      continue;
    }

    other.push({
      file: entry.name,
      mtime: fs.statSync(fullPath).mtimeMs,
    });
  }

  aNamed.sort((a, b) => a.index - b.index);
  other.sort((a, b) => a.mtime - b.mtime || a.file.localeCompare(b.file));

  const gallery = [];

  for (let i = 1; i <= 3; i += 1) {
    const found = aNamed.find((item) => item.index === i);
    if (found) gallery.push(found.file);
  }

  for (const item of other) {
    if (gallery.length >= 3) break;
    if (!gallery.includes(item.file)) gallery.push(item.file);
  }

  if (gallery.length === 0 && aNamed.length > 0) {
    gallery.push(...aNamed.slice(0, 3).map((item) => item.file));
  }

  if (gallery.length === 0 && other.length > 0) {
    gallery.push(...other.slice(0, 3).map((item) => item.file));
  }

  return gallery;
}

export function pickThumbnail(imageFiles) {
  return imageFiles.find((file) => /^a1\./i.test(file)) ?? imageFiles[0];
}

export function listExistingSources(root = defaultRoot) {
  return SOURCE_CANDIDATES(root).filter((candidate) => fs.existsSync(candidate));
}

export function discoverProducts(root = defaultRoot) {
  const sources = listExistingSources(root);
  const byNumber = new Map();

  for (const sourceRoot of sources) {
    for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const parsed = parseFolderName(entry.name);
      if (!parsed) continue;

      const folderPath = path.join(sourceRoot, entry.name);
      const imageFiles = readImages(folderPath);
      if (imageFiles.length === 0) continue;

      const existing = byNumber.get(parsed.number);
      if (
        !existing
        || imageFiles.length > existing.imageFiles.length
        || (
          imageFiles.length === existing.imageFiles.length
          && parsed.folderName.length > existing.folderName.length
        )
      ) {
        byNumber.set(parsed.number, {
          number: parsed.number,
          price: parsed.price,
          folderName: parsed.folderName,
          imageFiles,
        });
      }
    }
  }

  return { sources, byNumber };
}

export function syncProductsToDest(byNumber, sources, destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  for (const product of byNumber.values()) {
    const destFolder = path.join(destDir, product.folderName);
    fs.mkdirSync(destFolder, { recursive: true });

    for (const sourceRoot of sources) {
      for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        const parsed = parseFolderName(entry.name);
        if (!parsed || parsed.number !== product.number) continue;

        const srcFolder = path.join(sourceRoot, entry.name);
        for (const fileEntry of fs.readdirSync(srcFolder, { withFileTypes: true })) {
          if (!fileEntry.isFile() || !isImageFile(fileEntry.name)) continue;

          const from = path.join(srcFolder, fileEntry.name);
          const to = path.join(destFolder, fileEntry.name);
          if (!fs.existsSync(to)) {
            fs.copyFileSync(from, to);
          }
        }
      }
    }

    product.imageFiles = readImages(destFolder);
  }
}

export function buildProductRecords(byNumber) {
  const products = [];

  for (const product of byNumber.values()) {
    if (!product.imageFiles?.length) continue;

    const thumbnailFile = pickThumbnail(product.imageFiles);
    const images = product.imageFiles.map((file) =>
      toPublicUrl(product.folderName, file),
    );

    products.push({
      id: `s${product.number}`,
      number: product.number,
      folder: product.folderName,
      price: product.price,
      thumbnail: toPublicUrl(product.folderName, thumbnailFile),
      images,
    });
  }

  products.sort((a, b) => a.number - b.number);
  return products;
}

export function readFolderImages(root, folderName) {
  const destDir = path.join(root, 'Leather Shoes');
  const candidates = [
    path.join(destDir, folderName),
    ...listExistingSources(root).map((source) => path.join(source, folderName)),
  ];

  for (const folderPath of candidates) {
    const images = readImages(folderPath);
    if (images.length) return images;
  }

  for (const sourceRoot of listExistingSources(root)) {
    for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const parsed = parseFolderName(entry.name);
      if (!parsed || entry.name !== folderName) continue;
      return readImages(path.join(sourceRoot, entry.name));
    }
  }

  return [];
}

export function buildLeatherCatalog(root = defaultRoot) {
  const destDir = path.join(root, 'Leather Shoes');
  const { sources, byNumber } = discoverProducts(root);

  if (byNumber.size > 0) {
    syncProductsToDest(byNumber, sources, destDir);
  }

  const products = buildProductRecords(byNumber);
  const numbers = products.map((product) => product.number);
  const missing = [];

  for (let i = 1; i <= Math.max(17, ...numbers, 0); i += 1) {
    if (!numbers.includes(i)) missing.push(i);
  }

  return {
    generatedAt: new Date().toISOString(),
    sources,
    products,
    missing,
  };
}
