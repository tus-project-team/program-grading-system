import { useContext } from "react"

import { MarkdownEditorContext } from "../../contexts/markdown-editor-context"

export const useMarkdownEditor = () => {
  const context = useContext(MarkdownEditorContext)
  if (context === undefined) {
    throw new Error(
      "useMarkdownEditor must be used within a MarkdownEditorProvider",
    )
  }
  return context
}
