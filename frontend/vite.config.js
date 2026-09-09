import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/sipesand-core-[hash].js',
        chunkFileNames: 'assets/sipesand-chunk-[hash].js',
        assetFileNames: 'assets/sipesand-[name]-[hash].[ext]'
      }
    }
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore'],
    esbuildOptions: {
      // Shim untuk postinstall.mjs yang tidak tersedia di browser bundle
      plugins: [
        {
          name: 'shim-postinstall',
          setup(build) {
            build.onResolve({ filter: /postinstall\.mjs$/ }, () => ({
              path: 'postinstall-shim',
              namespace: 'sipesand-shim',
            }));
            build.onLoad({ filter: /.*/, namespace: 'sipesand-shim' }, () => ({
              contents: 'export function getDefaultsFromPostinstall() { return undefined; }',
            }));
          },
        },
      ],
      sourcemap: false,
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
