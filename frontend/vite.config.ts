import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config" 

export default defineConfig({
  plugins: [react()],
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