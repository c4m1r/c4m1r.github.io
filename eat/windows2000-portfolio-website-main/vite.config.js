import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://samnicklez.github.io/windows2000-portfolio-website/',
  publicPath: '/windows2000-portfolio-website/',
  baseUrl: '/windows2000-portfolio-website/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('a2k-')
        }
      }
    })
  ],
  optimizeDeps: {
    exclude: ['@a2000/icons']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
