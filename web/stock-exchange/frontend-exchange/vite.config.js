import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        host: true,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:3011',
                changeOrigin: true,
                secure: false
            },
            '/socket.io': {
                target: 'http://localhost:3011',
                changeOrigin: true,
                secure: false,
                ws: true
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: false
    }
})