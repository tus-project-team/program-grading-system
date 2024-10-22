import { build } from "esbuild"

await build({
  banner: {
    js: "#!/usr/bin/env node",
  },
  bundle: true,
  entryPoints: ["./src/index.ts"],
  format: "cjs",
  // For debug
  minify: false,
  outfile: "bin",
  platform: "node",
})
