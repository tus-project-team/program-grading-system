import { useContext } from "react"

import { ProblemsContext, ProblemsContextType } from "./problems-context"

export const useProblemsContext = (): ProblemsContextType => {
  const context = useContext(ProblemsContext)
  if (!context) {
    throw new Error("useProblemsContext must be used within a ProblemsProvider")
  }
  return context
}
