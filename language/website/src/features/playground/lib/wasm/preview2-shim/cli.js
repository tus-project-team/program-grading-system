import { _setCwd as fsSetCwd } from "./filesystem.js"
import { streams } from "./io.js"
const { InputStream, OutputStream } = streams

const symbolDispose = Symbol.dispose ?? Symbol.for("dispose")

let _args = [],
  _cwd = "/",
  _env = []
export function _setArgs(args) {
  _args = args
}
export function _setCwd(cwd) {
  fsSetCwd((_cwd = cwd))
}

export function _setEnv(envObj) {
  _env = Object.entries(envObj)
}

export const environment = {
  getArguments() {
    return _args
  },
  getEnvironment() {
    return _env
  },
  initialCwd() {
    return _cwd
  },
}

class ComponentExit extends Error {
  constructor(code) {
    super(`Component exited ${code === 0 ? "successfully" : "with error"}`)
    this.exitError = true
    this.code = code
  }
}

export const exit = {
  exit(status) {
    throw new ComponentExit(status.tag === "err" ? 1 : 0)
  },
  exitWithCode(code) {
    throw new ComponentExit(code)
  },
}

/**
 * @param {import('../common/io.js').OutputStreamHandler} handler
 */
export function _setStderr(handler) {
  stderrStream.handler = handler
}
/**
 * @param {import('../common/io.js').InputStreamHandler} handler
 */
export function _setStdin(handler) {
  stdinStream.handler = handler
}
/**
 * @param {import('../common/io.js').OutputStreamHandler} handler
 */
export function _setStdout(handler) {
  stdoutStream.handler = handler
}

const stdinStream = new InputStream({
  blockingRead(_len) {
    // TODO
  },
  subscribe() {
    // TODO
  },
  [symbolDispose]() {
    // TODO
  },
})
let textDecoder = new TextDecoder()
const stdoutStream = new OutputStream({
  blockingFlush() {},
  [symbolDispose]() {},
  write(contents) {
    if (contents.at(-1) == 10) {
      // console.log already appends a new line
      contents = contents.subarray(0, -1)
    }
    console.log(textDecoder.decode(contents))
  },
})
const stderrStream = new OutputStream({
  blockingFlush() {},
  [symbolDispose]() {},
  write(contents) {
    if (contents.at(-1) == 10) {
      // console.error already appends a new line
      contents = contents.subarray(0, -1)
    }
    console.error(textDecoder.decode(contents))
  },
})

export const stdin = {
  getStdin() {
    return stdinStream
  },
  InputStream,
}

export const stdout = {
  getStdout() {
    return stdoutStream
  },
  OutputStream,
}

export const stderr = {
  getStderr() {
    return stderrStream
  },
  OutputStream,
}

class TerminalInput {}
class TerminalOutput {}

const terminalStdoutInstance = new TerminalOutput()
const terminalStderrInstance = new TerminalOutput()
const terminalStdinInstance = new TerminalInput()

export const terminalInput = {
  TerminalInput,
}

export const terminalOutput = {
  TerminalOutput,
}

export const terminalStderr = {
  getTerminalStderr() {
    return terminalStderrInstance
  },
  TerminalOutput,
}

export const terminalStdin = {
  getTerminalStdin() {
    return terminalStdinInstance
  },
  TerminalInput,
}

export const terminalStdout = {
  getTerminalStdout() {
    return terminalStdoutInstance
  },
  TerminalOutput,
}
