import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function vendorChunkName(id: string) {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('/antd/') || id.includes('/@ant-design/') || id.includes('/rc-') || id.includes('/@rc-component/')) {
    return 'vendor-antd'
  }
  return 'vendor'
}

export default defineConfig({
  base: '/logistics/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: vendorChunkName,
      },
    },
  },
})
