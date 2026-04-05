import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8888',
        ws: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('recharts') || id.includes('/d3-')) {
            return 'charts';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('react')) {
            return 'react-vendor';
          }
        },
      },
    },
  }
})
