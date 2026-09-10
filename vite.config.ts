import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@firebase/analytics')) return 'firebase-analytics';
          if (id.includes('@firebase') || id.includes('/firebase/'))
            return 'firebase-vendor';
          if (id.includes('@tanstack')) return 'query-vendor';
          if (id.includes('@radix-ui')) return 'ui-vendor';
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router')
          )
            return 'react-vendor';
          return undefined;
        },
      },
    },
  },
});
