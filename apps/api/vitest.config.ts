import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: false,
    env: {
      DATABASE_URL:
        "postgres://shortlink:shortlink@localhost:5432/shortlink_test",
      JWT_SECRET: "test-secret",
      CORS_ORIGIN: "*",
    },
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/__tests__/**", "src/db/**", "src/index.ts"],
    },
  },
})
