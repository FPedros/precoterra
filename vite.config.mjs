import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, 'VITE_');
  const mapboxToken = process.env.VITE_MAPBOX_TOKEN ?? env.VITE_MAPBOX_TOKEN;
  if (mapboxToken && !mapboxToken.startsWith('pk.')) {
    throw new Error('VITE_MAPBOX_TOKEN deve ser um token público do Mapbox (pk.). Tokens secretos não podem ser incluídos no frontend.');
  }

  return {
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        analises: resolve(rootDir, 'analises.html'),
        precoTerra: resolve(rootDir, 'preco-terra.html'),
        politicaPrivacidade: resolve(rootDir, 'politica-privacidade.html'),
        // Blog temporariamente desativado:
        // blog: resolve(rootDir, 'blog.html'),
      },
    },
  },
  };
});
