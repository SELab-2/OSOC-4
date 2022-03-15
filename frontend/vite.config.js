import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const BASE = process.env.VITE_FRONTEND_BASE_URL || '';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: BASE + '/',
  prod: Boolean(BASE.indexOf("master") !== -1),
})