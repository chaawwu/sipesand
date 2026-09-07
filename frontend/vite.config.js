import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Multi-Page Dev Middleware untuk Rewrite otomatis Subdomain & Query
    {
      name: 'multi-page-subdomain-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
          const hostname = (req.headers.host || '').split(':')[0].toLowerCase();
          const view = url.searchParams.get('view') || url.searchParams.get('page');

          if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
            if (url.pathname === '/' || url.pathname === '/index.html') {
              if (hostname.startsWith('mitra.') || view === 'mitra' || view === 'developer') {
                req.url = '/mitra.html';
              } else if (hostname.startsWith('app.') || hostname.startsWith('apps.') || view === 'app' || view === 'apps') {
                req.url = '/app.html';
              } else if (
                (hostname.endsWith('.sipesand.web.id') && !hostname.startsWith('www.')) ||
                url.searchParams.get('tenant') ||
                url.searchParams.get('pondok') ||
                view === 'tenant' ||
                view === 'tenant-portal'
              ) {
                req.url = '/tenant.html';
              }
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
        mitra: resolve(__dirname, 'mitra.html'),
        tenant: resolve(__dirname, 'tenant.html'),
      }
    }
  },
  server: {
    host: true, // bind to 0.0.0.0 so accessible via LAN / IP / Public Tunnel
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
