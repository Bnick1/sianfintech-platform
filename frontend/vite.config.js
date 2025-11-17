import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: '/', // Ensure this is set to root
  server: {
    port: 3000
  }
})