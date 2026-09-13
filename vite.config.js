import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths work on GitHub Pages subpaths
  build: {
    outDir: 'dist',
  }
});
