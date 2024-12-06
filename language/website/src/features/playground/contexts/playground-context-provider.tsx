import { useState, type FC, type ReactNode } from "react"
import { PlaygroundContext, type Output } from "./playground-context"
import { runCli, transpile } from "../lib/wasm"
import { compile } from "../../../../generated/tools/tools"

type WasiCliRun = {
  "wasi:cli/run@0.2.2": {
    run: () => void
  }
}

export type PlaygroundProviderProps = {
  children?: ReactNode
}

export const PlaygroundProvider: FC<PlaygroundProviderProps> = ({
  children,
}) => {
  const [code, setCode] = useState("fn main () -> i32 { 0 }")
  const [output, setOutput] = useState<Output | undefined>(undefined)

  const run = async () => {
    const { ast, tokens, wasm } = compile(code)
    const { "wasi:cli/run@0.2.2": entrypoint } = await transpile<WasiCliRun>(
      wasm,
      "main"
    )
    const output = runCli(entrypoint.run)
    setOutput({
      ast,
      tokens,
      output,
    })
  }

  return (
    <PlaygroundContext.Provider value={{ code, setCode, output, run }}>
      {children}
    </PlaygroundContext.Provider>
  )
}
