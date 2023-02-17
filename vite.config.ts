import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),],
    resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server:{
		host:"0.0.0.0",
    proxy:{
      "/upload":{
        target: "http://localhost:5171/upload",
				changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, '')
      },
      "/static":{
        target: "http://localhost:5171/",
				changeOrigin: true,
        rewrite: (path) => path.replace(/^\/static/, '')
      },
      "/server":{
        target: "http://localhost:5171/Perception",
				changeOrigin: true,
        rewrite: (path) => path.replace(/^\/server/, '')
      }
    }
  },
	build:{
		sourcemap:true
	}
})
