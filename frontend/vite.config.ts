import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config" 
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true, 
    environment: 'jsdom', 
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/**/*.test.empty.{ts,tsx}'],
  },
})