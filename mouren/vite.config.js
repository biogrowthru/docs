import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' — сайт открывается из любой папки и с любого хостинга
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: { main: 'index.html', product: 'product.html' } },
  },
})
