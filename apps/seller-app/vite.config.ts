import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/seller/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@steellink/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
