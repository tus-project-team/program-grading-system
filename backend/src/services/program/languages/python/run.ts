import path from "node:path"
import { stdin } from "node:process"
import { loadPyodide } from "pyodide"

/**
 * Handles the standard input for the Python code.
 * @see https://pyodide.org/en/stable/usage/streams.html#a-stdin-handler
 */
class StdinHandler {
  idx: number
  options: unknown
  results: string[]

  constructor(results: string[], options?: unknown) {
    this.idx = 0
    this.results = results
    this.options = options
    Object.assign(this, options)
  }

  stdin() {
    return this.results[this.idx++]
  }
}

/**
 * Handles the standard output for the Python code.
 */
class StdoutHandler {
  output: string

  constructor() {
    this.output = ""
  }

  batched(output: string) {
    this.output += output
  }
}

type RunResult = {
  result: unknown
  stdout: string
}

export const runPythonCode = async (code: string, input: string): RunResult => {
  const pyodide = await loadPyodide({
    indexURL: path.resolve(
      import.meta.dirname,
      "../../../../../node_modules/pyodide",
    ),
  })

  const stdinHandler = new StdinHandler(input.split("\n"))
  pyodide.setStdin(stdinHandler)

  const stdoutHandler = new StdoutHandler()
  pyodide.setStdout(stdoutHandler)

  const result = await pyodide.runPythonAsync(code)

  return {
    result,
    stdout: stdoutHandler.output,
  }
}
