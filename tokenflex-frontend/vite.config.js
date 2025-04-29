import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// URI malformed hatasını çözmek için
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // Türkçe karakter sorunu çözümü
  server: {
    fs: {
      strict: false
    },
    // Daha güvenli URL encoding için
    hmr: {
      overlay: false
    }
  }
});