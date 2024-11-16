import { MarkdownEditorProvider } from "../contexts/markdown-editor-context"
import { Editor } from "./editor"
import { Preview } from "./preview"

export const MarkdownEditor = () => {
  return (
    <MarkdownEditorProvider>
      <div className="divide grid grid-cols-2 divide-x rounded-lg border">
        <Editor />
        <Preview />
      </div>
    </MarkdownEditorProvider>
  )
}
