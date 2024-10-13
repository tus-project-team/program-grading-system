import type { FC } from "react"

import { cn } from "@/lib/utils"
import MonacoEditor from "@monaco-editor/react"

import type { Language } from "../../-contexts/problem-context/problem-context"

export type EditorProps = {
  className?: string
  language: Language
}

export const Editor: FC<EditorProps> = ({ className, language }) => {
  return (
    <div className={cn("h-full", className)}>
      <MonacoEditor height="100%" language={language.name} />
    </div>
  )
}
