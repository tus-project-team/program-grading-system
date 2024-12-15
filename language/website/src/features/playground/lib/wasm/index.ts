import { generate } from "@bytecodealliance/jco/component"
import { rollup } from "@rollup/browser"

import preview2_shim_cli from "./preview2-shim/cli.js?raw"
import preview2_shim_clocks from "./preview2-shim/clocks.js?raw"
import preview2_shim_filesystem from "./preview2-shim/filesystem.js?raw"
import preview2_shim_http from "./preview2-shim/http.js?raw"
import preview2_shim_io from "./preview2-shim/io.js?raw"
import preview2_shim_random from "./preview2-shim/random.js?raw"
import preview2_shim_sockets from "./preview2-shim/sockets.js?raw"

export const transpile = async <T = unknown>(
  buffer: Uint8Array,
  name: string,
) => {
  const transpiled = await generate(buffer, {
    map: Object.entries(
      // @see https://github.com/bytecodealliance/jco/blob/7b6e3867b02e2546dcd179238f2f1694c981a20c/src/cmd/transpile.js#L156-L166
      {
        "wasi:cli/*": "@bytecodealliance/preview2-shim/cli#*",
        "wasi:clocks/*": "@bytecodealliance/preview2-shim/clocks#*",
        "wasi:filesystem/*": "@bytecodealliance/preview2-shim/filesystem#*",
        "wasi:http/*": "@bytecodealliance/preview2-shim/http#*",
        "wasi:io/*": "@bytecodealliance/preview2-shim/io#*",
        "wasi:random/*": "@bytecodealliance/preview2-shim/random#*",
        "wasi:sockets/*": "@bytecodealliance/preview2-shim/sockets#*",
      },
    ),
    name,
    noNodejsCompat: true,
    noTypescript: true,
  })
  console.log(transpiled)

  const decoder = new TextDecoder()
  const modules: Record<string, string | Uint8Array> = Object.fromEntries(
    transpiled.files.map(([name, buffer]) => [name, buffer]),
  )
  modules["@bytecodealliance/preview2-shim/cli"] = preview2_shim_cli
  modules["@bytecodealliance/preview2-shim/clocks"] = preview2_shim_clocks
  modules["@bytecodealliance/preview2-shim/filesystem"] =
    preview2_shim_filesystem
  modules["@bytecodealliance/preview2-shim/http"] = preview2_shim_http
  modules["@bytecodealliance/preview2-shim/io"] = preview2_shim_io
  modules["@bytecodealliance/preview2-shim/random"] = preview2_shim_random
  modules["@bytecodealliance/preview2-shim/sockets"] = preview2_shim_sockets

  const code = await rollup({
    input: `${name}.js`,
    plugins: [
      {
        load(id) {
          console.log("load", id)
          if (id in modules) {
            const buffer = modules[id]
            if (typeof buffer === "string") return buffer
            if (id.endsWith(".wasm")) return buffer as unknown as string
            return decoder.decode(buffer)
          }
          console.error("failed to load", id)
        },
        name: "virtual",
        resolveId(source, importer) {
          console.log("resolveId", source)
          if (source in modules) {
            return source
          }

          // resolve relative imports from "@bytecodealliance/preview2-shim"
          if (importer?.startsWith("@bytecodealliance/preview2-shim")) {
            const sourceModuleName = source?.match(/(\.\/)?(.*?)(\.js)?$/)?.[2]
            return ["@bytecodealliance/preview2-shim", sourceModuleName]
              .filter(Boolean)
              .join("/")
          }

          console.error("failed to resolveId", source, "from", importer)
        },
        transform(code, id) {
          if (!id.endsWith(".js")) return

          const urls = code.matchAll(
            /new\s+URL\(([^)]+),\s+import\.meta\.url\)/g,
          )
          for (const url of urls) {
            const [_, src] = url
            if (!src) continue
            const urlStr = src.replaceAll(/["']/g, "").replace(/^\.\//, "")
            console.log("transform", urlStr)
            const mod = modules[urlStr]
            if (mod) {
              const url = URL.createObjectURL(
                new Blob([mod], { type: "application/wasm" }),
              )
              if (!url) continue
              code = code.replace(
                new RegExp(`new\\s+URL\\(${src},\\s+import\\.meta\\.url\\)`),
                `"${url}"`,
              )
            }
          }

          return {
            code,
            map: { mappings: "" },
          }
        },
      },
    ],
  })
    .then((bundle) => bundle.generate({ format: "es" }))
    .then(({ output }) => output[0].code)

  const mod: T = await import(
    URL.createObjectURL(new Blob([code], { type: "application/javascript" }))
  )
  return mod
}

export const runCli = (run: () => void) => {
  let output = ""
  const originalLog = console.log
  console.log = (...args: unknown[]) => {
    output += args.join(" ") + "\n"
  }
  run()
  console.log = originalLog
  return output
}
