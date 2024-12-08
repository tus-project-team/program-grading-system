import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import tsconfigPaths from "vite-tsconfig-paths"

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      customCss: ["./src/tailwind.css"],
      sidebar: [
        {
          items: [{ label: "Introduction", slug: "guides/introduction" }],
          label: "Guides",
        },
      ],
      social: {
        github: "https://github.com/shuiro-dev/shuiro",
      },
      title: "Shuiro Language",
    }),
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ["@bytecodealliance/jco/component", "@rollup/browser"],
    },
    plugins: [tsconfigPaths()],
  },
})
