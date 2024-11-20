import type { ComponentPropsWithoutRef, FC } from "react"

import { cn } from "@/lib/utils"


export type TestCasesProps = ComponentPropsWithoutRef<"div">

// todo: Implement TestCases
export const TestCases: FC<TestCasesProps> = ({ className, ...props }) => {
  
  return (
    <div className={cn("grid grid-cols-[auto_lfr_auto]",className)} {...props}>
      WIP: Display test cases
    </div>
  )
}
