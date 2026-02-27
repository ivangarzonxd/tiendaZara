import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración optimizada para integrar React dentro de la carpeta public de Symfony
export default defineConfig({
  plugins: [react()],
  
  // El punto hace que las rutas de los assets sean relativas (./), 
  // permitiendo que el index.html funcione correctamente desde cualquier subcarpeta.
  base: './', 

  server: {
    port: 3000,
    proxy: {
      // Redirige las peticiones de datos al servidor de Symfony
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Redirige la carga de imágenes y videos al servidor de Symfony
      '/recursos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Genera los archivos directamente en la carpeta public de tu backend Symfony
    // Suponiendo que la estructura es: /proyecto/frontend y /proyecto/public
    outDir: '../public',
    
    // IMPORTANTE: Evita que Vite borre la carpeta 'recursos' (donde tienes tus fotos y video) 
    // al realizar una nueva construcción del proyecto.
    emptyOutDir: false,

    // Organiza los archivos JS y CSS dentro de una carpeta assets para mantener el orden
    assetsDir: 'assets',
  },
});