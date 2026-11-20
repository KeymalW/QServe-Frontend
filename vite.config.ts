/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import os from 'node:os'
import path from 'path'

const lanAddresses = Object.values(os.networkInterfaces())
  .flatMap((interfaces) => interfaces ?? [])
  .filter((details) => details.family === 'IPv4' && !details.internal)
  .map((details) => details.address)

export default defineConfig({
  plugins: [
    react(),
    basicSsl({
      name: 'qserve.local',
      domains: ['localhost', ...lanAddresses],
      certDir: path.resolve(__dirname, 'node_modules/.vite/basic-ssl-qserve'),
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://qserve-backend-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://qserve-backend-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
