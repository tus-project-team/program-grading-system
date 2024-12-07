import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      customCss: ["./src/tailwind.css"],
      sidebar: [
        {
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
          label: "Guides",
        },
        {
          autogenerate: { directory: "reference" },
          label: "Reference",
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
  },
})
