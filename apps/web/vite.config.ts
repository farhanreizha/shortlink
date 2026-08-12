import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/react") ||
            id.includes("/node_modules/react-dom") ||
            id.includes("/node_modules/scheduler")
          ) {
            return "react"
          }
        },
      },
    },
  },
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
