import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
    },
    setupFiles: ["vitest.setup.ts"],
  },
})
