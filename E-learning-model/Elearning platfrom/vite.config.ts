import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'  // ← add this import

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // ← this makes @/ point to src/
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})