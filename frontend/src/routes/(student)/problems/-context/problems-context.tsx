import { $api } from "@/lib/api"
import { UseSuspenseQueryResult } from "@tanstack/react-query"
import { components } from "openapi/schema"
import { createContext } from "react"

export type Problem = components["schemas"]["Problem"]

export type ProblemsContextType = {
  problems: UseSuspenseQueryResult<Problem[], undefined>
}

// ProblemsProvider の Props 型
export type ProblemsProviderProps = {
  children?: React.ReactNode
}

export const ProblemsContext = createContext<ProblemsContextType | undefined>(
  undefined,
)

export const ProblemsProvider: React.FC<ProblemsProviderProps> = ({
  children,
}) => {
  const problems = $api.useSuspenseQuery("get", "/api/problems")

  return (
    <ProblemsContext.Provider value={{ problems }}>
      {children}
    </ProblemsContext.Provider>
  )
}
