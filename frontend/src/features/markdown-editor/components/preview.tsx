import Markdown from "react-markdown"

import { useMarkdownEditor } from "../hooks/use-markdown-editor"

export const Preview = () => {
  const { source } = useMarkdownEditor()

  return (
    <Markdown className="prose h-full overflow-y-auto p-4">{source}</Markdown>
  )
}
