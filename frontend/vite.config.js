import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React se integra dentro de la carpeta public/ de Symfony
export default defineConfig({
  plugins: [react()],

  // Rutas relativas (./) para que funcione servido por Apache/Symfony
  base: './',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/recursos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Genera los archivos directamente en public/ de Symfony
    outDir: '../public',

    // NO borrar recursos/, index.php ni .htaccess
    emptyOutDir: false,

    // JS y CSS van dentro de assets/
    assetsDir: 'assets',
  },
});
