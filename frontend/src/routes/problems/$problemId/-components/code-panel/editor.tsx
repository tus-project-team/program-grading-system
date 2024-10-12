import type { FC } from "react"
import MonacoEditor from "@monaco-editor/react"
import { cn } from "@/lib/utils"
import type { Language } from "../../-contexts/problem-context/problem-context"

export type EditorProps = {
  className?: string
  language: Language
}

export const Editor: FC<EditorProps> = ({ className, language }) => {
  return (
    <div className={cn("h-full py-2", className)}>
      <MonacoEditor height="100%" language={language.name} />
    </div>
  )
}
