import { FC, ReactNode, useEffect, useState } from "react"

import { MarkdownEditorContext } from "./markdown-editor-context"

export type MarkdownEditorProviderProps = {
  children?: ReactNode
  defaultSource?: string
  onChangeSource?: (source: string) => void
}

export const MarkdownEditorProvider: FC<MarkdownEditorProviderProps> = ({
  children,
  defaultSource = "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChangeSource = () => {},
}) => {
  const [source, setSource] = useState(defaultSource)

  useEffect(() => {
    onChangeSource(source)
  }, [source, onChangeSource])

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
