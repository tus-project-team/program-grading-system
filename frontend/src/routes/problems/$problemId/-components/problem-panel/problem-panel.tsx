import type { ComponentPropsWithoutRef, FC } from "react"
import Markdown from "react-markdown"
import { useProblem } from "../../-contexts/problem-context/problem-context"
import { cn } from "@/lib/utils"

export type ProblemPanelProps = ComponentPropsWithoutRef<"div">

export const ProblemPanel: FC<ProblemPanelProps> = ({
  className,
  ...props
}) => {
  const { problem } = useProblem()

  return (
    <div className={cn("space-y-4 p-4", className)} {...props}>
      <h1 className="text-2xl font-bold">{problem.title}</h1>
      <div>
        <h2 className="mb-2 text-lg font-semibold">問題文</h2>
        <Markdown>{problem.body}</Markdown>
      </div>
    </div>
  )
}
