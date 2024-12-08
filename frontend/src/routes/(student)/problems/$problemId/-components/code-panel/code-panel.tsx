import type { ComponentPropsWithoutRef, FC } from "react"

import { cn } from "@/lib/utils"

import { Editor } from "./editor"
import { LanguageSelector } from "./language-selector"
import { SubmitButton } from "./submit-button"
import { TestButton } from "./test-button"

export type CodePanelProps = ComponentPropsWithoutRef<"div">

export const CodePanel: FC<CodePanelProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("flex h-full flex-col gap-2 pt-2", className)}
      {...props}
    >
      <div className="flex flex-row items-center justify-between gap-4 px-4">
        <LanguageSelector />
        <div className="flex flex-row gap-2">
          <TestButton />
          <SubmitButton />
        </div>
      </div>
      <Editor />
    </div>
  )
}
