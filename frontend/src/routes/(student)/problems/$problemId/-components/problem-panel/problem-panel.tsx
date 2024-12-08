import type { ComponentPropsWithoutRef, FC } from "react"

import { cn } from "@/lib/utils"
import Markdown from "react-markdown"

import { useProblem } from "../../-hooks/use-problem"

export type ProblemPanelProps = ComponentPropsWithoutRef<"div">

export const ProblemPanel: FC<ProblemPanelProps> = ({
  className,
  ...props
}) => {
  const { problem } = useProblem()

  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      <h1 className="text-2xl font-bold">{problem.data.title}</h1>
      <div>
        <h2 className="mb-2 text-lg font-semibold">問題文</h2>
        <Markdown>{problem.data.body}</Markdown>
      </div>
    </div>
  )
}
