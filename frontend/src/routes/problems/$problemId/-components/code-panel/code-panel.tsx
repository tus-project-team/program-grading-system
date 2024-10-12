import type { ComponentPropsWithoutRef, FC } from "react"
import { Editor } from "./editor"
import { useProblem } from "../../-contexts/problem-context/problem-context"
import { cn } from "@/lib/utils"
import { LanguageSelector } from "./language-selector"
import { SubmitButton } from "./submit-button"
import { TestButton } from "./test-button"

export type CodePanelProps = ComponentPropsWithoutRef<"div">

export const CodePanel: FC<CodePanelProps> = ({ className, ...props }) => {
  const { language } = useProblem()

  return (
    <div className={cn("h-full", className)} {...props}>
      <div className="flex flex-row items-center justify-between px-4 py-2">
        <LanguageSelector />
        <div className="flex flex-row gap-2">
          <TestButton />
          <SubmitButton />
        </div>
      </div>
      <Editor language={language} />
    </div>
  )
}
