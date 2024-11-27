import type { ComponentPropsWithoutRef, FC } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useProblem } from "../../-hooks/use-problem"

export type TestCasesProps = ComponentPropsWithoutRef<"div">

// todo: Implement TestCases
export const TestCases: FC<TestCasesProps> = ({ className, ...props }) => {
  const { problem } = useProblem()
  return (
    <div className={cn("grid grid-cols-[auto_lfr_auto]", className)} {...props}>
      {problem.data?.test_cases.map(({ input, output }, i) => (
        <Button
          className="col-span-2 grid grid-cols-subgrid gap-4"
          key={i}
          size="sm"
          variant="ghost"
        >
          <div className="text-left">入力：{input}</div>
          <div className="text-left">出力：{output}</div>
        </Button>
      ))}
    </div>
  )
}
