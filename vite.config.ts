import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    port: parseInt(process.env['PORT'] ?? '5173'),
    strictPort: true,
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
    assetsInlineLimit: 100000,
    reportCompressedSize: true,
  },
  test: {
    environment: 'node',
  },
})
