import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef, FC } from "react"

import { MarkdownEditorProvider } from "../contexts/markdown-editor-context"
import { MarkdownEditorProviderProps } from "../contexts/markdown-editor-context/markdown-editor-provider"
import { Editor } from "./editor"
import { Preview } from "./preview"

export type MarkdownEditorProps = ComponentPropsWithoutRef<"div"> &
  MarkdownEditorProviderProps

export const MarkdownEditor: FC<MarkdownEditorProps> = ({
  className,
  defaultSource,
  onChangeSource,
  setSource,
  source,
  ...props
}) => {
  return (
    <MarkdownEditorProvider
      defaultSource={defaultSource}
      onChangeSource={onChangeSource}
      setSource={setSource}
      source={source}
    >
      <div
        className={cn(
          "divide grid h-full grid-cols-1 grid-rows-[50%_50%] divide-y rounded-md border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:grid-cols-2 md:grid-rows-1 md:divide-x md:divide-y-0",
          className,
        )}
        {...props}
      >
        <Editor />
        <Preview />
      </div>
    </MarkdownEditorProvider>
  )
}
