import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
		host:"0.0.0.0",
    proxy:{
      "/server":{
        target: "http://localhost:5171/Perception",
				changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, '')
      }
    }
		
  }
})
