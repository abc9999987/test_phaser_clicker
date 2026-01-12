import { defineConfig } from 'vite';

export default defineConfig({
  base: '/test_phaser_clicker/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 8000,
    open: true
  },
  preview: {
    port: 8000
  }
});
