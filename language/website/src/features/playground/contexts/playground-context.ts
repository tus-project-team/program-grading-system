import { createContext } from "react"

export type Output = {
  ast: string
  output: string
  tokens: string
}

export type PlaygroundContext = {
  code: string
  output: Output | undefined
  run: () => Promise<void>
  setCode: (code: string) => void
}

export const PlaygroundContext = createContext<PlaygroundContext | undefined>(
  undefined,
)
