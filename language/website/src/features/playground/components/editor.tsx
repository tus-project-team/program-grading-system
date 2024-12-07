import type { FC } from "react"

import { cn } from "@/lib/utils/classes"
import MonacoEditor from "@monaco-editor/react"

import { usePlayground } from "../hooks/use-playground"

export type EditorProps = {
  className?: string
}

export const Editor: FC<EditorProps> = ({ className }) => {
  const { code, setCode } = usePlayground()

  return (
    <div className={cn("h-full flex-1", className)}>
      <MonacoEditor
        height="100%"
        language="plaintext"
        onChange={(value) => setCode(value ?? "")}
        value={code}
      />
    </div>
  )
}
