import type { FC } from "react"

import { cn } from "@/lib/utils"
import MonacoEditor from "@monaco-editor/react"

import { useProblem } from "../../-hooks/use-problem"

export type EditorProps = {
  className?: string
}

export const Editor: FC<EditorProps> = ({ className }) => {
  const { code, language, setCode } = useProblem()

  return (
    <div className={cn("h-full", className)}>
      <MonacoEditor
        height="100%"
        language={language.name.toLowerCase()}
        onChange={(value) => value && setCode(value)}
        value={code}
      />
    </div>
  )
}
