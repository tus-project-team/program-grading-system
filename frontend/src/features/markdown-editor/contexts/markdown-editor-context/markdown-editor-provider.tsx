import { useControlledState } from "@/hooks/use-controlled-state"
import { Dispatch, FC, ReactNode, SetStateAction, useEffect } from "react"

import { MarkdownEditorContext } from "./markdown-editor-context"

export type MarkdownEditorProviderProps = {
  children?: ReactNode
  defaultSource?: string
  onChangeSource?: (source: string) => void
  setSource?: Dispatch<SetStateAction<string>>
  source?: string
}

export const MarkdownEditorProvider: FC<MarkdownEditorProviderProps> = ({
  children,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChangeSource = () => {},
  ...props
}) => {
  const [source, setSource] = useControlledState(
    props.defaultSource ?? "",
    props.source,
    props.setSource,
  )

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
