import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga todas las variables de entorno sin importar el prefijo
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Reemplazo directo en el código fuente durante la compilación/dev
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    },
    server: {
      watch: {
        usePolling: true
      }
    }
  };
});
