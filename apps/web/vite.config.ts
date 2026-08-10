import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: true,
  },
  server: {
    allowedHosts: true,
    host: true,
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/r/": "http://localhost:3001",
    },
  },
})
