import { createContext, Dispatch, SetStateAction } from "react"

export type MarkdownEditorContext = {
  /**
   * Set the markdown source.
   */
  setSource: Dispatch<SetStateAction<string>>

  /**
   * The markdown source.
   *
   * @example "# Hello, world!"
   */
  source: string
}

export const MarkdownEditorContext = createContext<
  MarkdownEditorContext | undefined
>(undefined)
