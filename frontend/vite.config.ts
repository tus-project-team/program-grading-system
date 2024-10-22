import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import path from "node:path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      generatedRouteTree: path.resolve(
        import.meta.dirname,
        "./src/route-tree.gen.ts",
      ),
      quoteStyle: "double",
      routeFileIgnorePattern: ".(stories|test).(js|jsx|ts|tsx)",
      routeTreeFileHeader: [
        "/* prettier-ignore-start */",
        "/* eslint-disable unicorn/no-abusive-eslint-disable */",
        "/* eslint-disable */",
        "// @ts-nocheck",
        "// noinspection JSUnusedGlobalSymbols",
      ],
      semicolons: false,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
