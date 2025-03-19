// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'frontend'), // Set 'frontend' as the root
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist/frontend'), // Adjust build output if needed
  },
  server: {
    port: 3000,
    open: true, // Automatically open the browser
  },
});