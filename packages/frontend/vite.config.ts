import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('node_modules/zustand')) return 'state-vendor';
          if (id.includes('node_modules/@tanstack')) return 'query-vendor';
          if (id.includes('node_modules/recharts')) return 'chart-vendor';
          if (id.includes('node_modules/')) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
