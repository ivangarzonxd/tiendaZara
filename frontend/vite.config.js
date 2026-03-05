import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración optimizada para integrar React dentro de la carpeta public de Symfony
export default defineConfig({
  plugins: [react()],
  
  // Base '/' para que los assets se carguen correctamente con React Router.
  // Las rutas como /producto/1 necesitan paths absolutos, no relativos.
  base: '/', 

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