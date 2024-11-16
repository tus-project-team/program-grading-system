import Markdown from "react-markdown"

import { useMarkdownEditor } from "../hooks/use-markdown-editor"

export const Preview = () => {
  const { source } = useMarkdownEditor()

  return <Markdown className="prose p-4">{source}</Markdown>
}
