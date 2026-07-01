import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  buildLeatherCatalog,
  readFolderImages,
  toPublicUrl,
  pickThumbnail,
} from './scripts/leather-catalog-core.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const MIME: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
};

const ROOT_ASSETS = ['i3.png', 'i4.png', 'favicon.svg', 'loader.mp4', 'contact.mp4'];
const ROOT_FILES = [
  'style.css',
  'mobile.css',
  'hero-mobile.css',
  'site.js',
  'landing.js',
  'about.js',
  'collection.js',
  'collection-catalog.js',
  'collection-buy.js',
  'google-sheets-service.js',
  'contact.js',
  ...ROOT_ASSETS,
];
const STATIC_DIRS = ['public2', 'public3', 'homepage_frames', 'frames'];
const HTML_PAGES: Record<string, string> = {
  '/about': 'about/index.html',
  '/about/': 'about/index.html',
  '/brands': 'brands/index.html',
  '/brands/': 'brands/index.html',
  '/collection': 'collection/index.html',
  '/collection/': 'collection/index.html',
  '/contact': 'contact/index.html',
  '/contact/': 'contact/index.html',
};

function sendFile(res: ServerResponse, filePath: string): boolean {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function resolveRootAsset(name: string): string | null {
  const candidates = [
    path.join(rootDir, 'public', name),
    path.join(rootDir, name),
  ];

  if (name === 'loader.mp4') {
    candidates.unshift(path.join(rootDir, 'Loader.mp4'));
  }

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function staticSitePlugin(): Plugin {
  return {
    name: 'static-site',
    configureServer(server) {
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const rawUrl = req.url ?? '';
          // Let Vite handle CSS/JS module imports (e.g. /mobile.css?import)
          if (rawUrl.includes('?import') || rawUrl.startsWith('/@') || rawUrl.startsWith('/src/')) {
            return next();
          }

          const url = rawUrl.split('?')[0];
          if (!url) return next();

          if (url === '/leather-shoes-catalog.json' && req.method === 'GET') {
            const catalog = buildLeatherCatalog(rootDir);
            res.setHeader('Content-Type', 'application/json');
            res.end(
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
            return;
          }

          if (url === '/api/leather-product-images' && req.method === 'GET') {
            const folder = new URL(rawUrl, 'http://localhost').searchParams.get('folder');
            if (!folder) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'folder required' }));
              return;
            }

            const imageFiles = readFolderImages(rootDir, folder);
            const thumbnailFile = pickThumbnail(imageFiles);
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                folder,
                thumbnail: thumbnailFile
                  ? toPublicUrl(folder, thumbnailFile)
                  : null,
                images: imageFiles.map((file) => toPublicUrl(folder, file)),
              }),
            );
            return;
          }

          const decodedUrl = decodeURIComponent(url);
          if (
            decodedUrl === '/Leather Shoes' ||
            decodedUrl.startsWith('/Leather Shoes/')
          ) {
            const filePath = path.join(rootDir, decodedUrl.slice(1));
            if (sendFile(res, filePath)) return;
          }

          const page = HTML_PAGES[url];
          if (page) {
            const htmlPath = path.join(rootDir, page);
            if (sendFile(res, htmlPath)) return;
          }

          const fileName = url.replace(/^\//, '');
          if (ROOT_FILES.includes(fileName)) {
            const assetPath =
              ROOT_ASSETS.includes(fileName)
                ? resolveRootAsset(fileName)
                : path.join(rootDir, fileName);
            if (assetPath && sendFile(res, assetPath)) return;
          }

          for (const dir of STATIC_DIRS) {
            if (url === `/${dir}` || url.startsWith(`/${dir}/`)) {
              const filePath = path.join(rootDir, url.slice(1));
              if (sendFile(res, filePath)) return;
            }
          }

          next();
        },
      );
    },
    generateBundle() {
      for (const name of ROOT_ASSETS) {
        const filePath = resolveRootAsset(name);
        if (!filePath) continue;
        this.emitFile({
          type: 'asset',
          fileName: name,
          source: fs.readFileSync(filePath),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), staticSitePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
        about: path.resolve(rootDir, 'about/index.html'),
        contact: path.resolve(rootDir, 'contact/index.html'),
      },
    },
  },
});
