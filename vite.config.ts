import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',            // открыть сайт по https://c4m1r.github.io/
  build: {
    outDir: 'dist'      // стандартная папка для сборки Vite
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
