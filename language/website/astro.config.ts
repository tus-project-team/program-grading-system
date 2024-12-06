import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import arraybuffer from "vite-plugin-arraybuffer";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Shuiro Language",
      social: {
        github: "https://github.com/shuiro-dev/shuiro",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/tailwind.css"],
    }),
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  vite: {
    optimizeDeps: {
      exclude: ["@bytecodealliance/jco/component", "@rollup/browser"],
    },
    plugins: [arraybuffer()],
  },
});
