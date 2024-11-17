import { useContext } from "react"

import { ProblemContext } from "../../-context/problem-context"

export const useProblem = () => {
  const context = useContext(ProblemContext)
  if (context === undefined) {
    throw new Error("useProblem must be used within a ProblemProvider")
  }
  return context
}
