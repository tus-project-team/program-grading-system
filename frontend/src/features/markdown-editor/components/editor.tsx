import MonacoEditor from "@monaco-editor/react"

import { useMarkdownEditor } from "../hooks/use-markdown-editor"

export const Editor = () => {
  const { setSource, source } = useMarkdownEditor()

  return (
    <MonacoEditor
      className="py-2 pl-1"
      height="100%"
      language="markdown"
      onChange={(value) => setSource(value ?? "")}
      value={source}
    />
  )
}
