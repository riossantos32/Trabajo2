import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: 'lodash',
        replacement: 'lodash-es'
      },
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})