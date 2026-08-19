// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const astroTsconfigs = path.resolve(__dirname, 'node_modules/astro/tsconfigs');

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'astro/tsconfigs/base': path.join(astroTsconfigs, 'base.json'),
        'astro/tsconfigs/strict': path.join(astroTsconfigs, 'strict.json'),
        'astro/tsconfigs/strictest': path.join(astroTsconfigs, 'strictest.json')
      }
    }
  }
});
