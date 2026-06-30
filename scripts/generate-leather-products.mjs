import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLeatherCatalog } from './leather-catalog-core.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(root, 'public', 'leather-shoes-catalog.json');

function main() {
  const catalog = buildLeatherCatalog(root);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: catalog.generatedAt,
        source: catalog.sources[0] ?? null,
        products: catalog.products,
      },
      null,
      2,
    ),
  );

  const numbers = catalog.products.map((product) => product.number).join(', ');
  const imageSummary = catalog.products
    .map((product) => `${product.number}:${product.images.length}`)
    .join(', ');

  if (catalog.products.length > 0) {
    console.log(
      `Leather catalog: ${catalog.products.length} products [${numbers}]`,
    );
    console.log(`Images per product: ${imageSummary}`);
    if (catalog.missing.length) {
      console.log(`Missing product numbers: ${catalog.missing.join(', ')}`);
    }
    console.log(`→ public/leather-shoes-catalog.json`);
  } else {
    console.log(
      'Leather catalog: no product folders found (add folders like "S11 650" under Desktop/leather shoes/)',
    );
  }
}

main();
