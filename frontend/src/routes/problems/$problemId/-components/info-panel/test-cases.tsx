import type { ComponentPropsWithoutRef, FC } from "react"

export type TestCasesProps = ComponentPropsWithoutRef<"div">

// todo: Implement TestCases
export const TestCases: FC<TestCasesProps> = ({ className, ...props }) => {
  return (
    <div className={className} {...props}>
      WIP: Display test cases
    </div>
  )
}
