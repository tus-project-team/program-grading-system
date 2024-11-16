import { FC, ReactNode, useState } from "react"

import { MarkdownEditorContext } from "./markdown-editor-context"

export type MarkdownEditorProviderProps = {
  children?: ReactNode
}

export const MarkdownEditorProvider: FC<MarkdownEditorProviderProps> = ({
  children,
}) => {
  const [source, setSource] = useState("")

  return (
    <MarkdownEditorContext.Provider
      value={{
        setSource,
        source,
      }}
    >
      {children}
    </MarkdownEditorContext.Provider>
  )
}
