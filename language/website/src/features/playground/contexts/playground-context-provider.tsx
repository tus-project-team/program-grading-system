import { type FC, type ReactNode, useState } from "react"

import { compile } from "../../../../generated/tools/tools"
import { runCli, transpile } from "../lib/wasm"
import { type Output, PlaygroundContext } from "./playground-context"

export type PlaygroundProviderProps = {
  children?: ReactNode
}

type WasiCliRun = {
  "wasi:cli/run@0.2.2": {
    run: () => void
  }
}

export const PlaygroundProvider: FC<PlaygroundProviderProps> = ({
  children,
}) => {
  const [code, setCode] = useState("fn main () -> i32 { 0 }")
  const [output, setOutput] = useState<Output | undefined>()

  const run = async () => {
    const { ast, tokens, wasm } = compile(code)
    const { "wasi:cli/run@0.2.2": entrypoint } = await transpile<WasiCliRun>(
      wasm,
      "main",
    )
    const output = runCli(entrypoint.run)
    console.log({ ast: JSON.parse(ast), output, tokens: JSON.parse(tokens) })
    setOutput({
      ast,
      output,
      tokens,
    })
  }

  return (
    <PlaygroundContext.Provider value={{ code, output, run, setCode }}>
      {children}
    </PlaygroundContext.Provider>
  )
}
