import type { ComponentPropsWithoutRef, FC } from "react"

export type TestResultsProps = ComponentPropsWithoutRef<"div">

// todo: Implement TestResults
export const TestResults: FC<TestResultsProps> = ({ className, ...props }) => {
  return (
    <div className={className} {...props}>
      WIP: Display test results
    </div>
  )
}
