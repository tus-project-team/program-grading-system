import { build } from "esbuild"

const b = () =>
  build({
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

Promise.all([b()])
