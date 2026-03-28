import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Use the repo name as the base path when deploying to GitHub Pages.
  // For a custom domain (or a username.github.io repo), change this to '/'.
  base: '/SummleSolver/',
  plugins: [vue(), tailwindcss()],
  test: {
    environment: 'jsdom',
  },
})
