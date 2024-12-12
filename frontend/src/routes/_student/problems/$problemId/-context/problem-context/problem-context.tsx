import { $api } from "@/lib/api"
import { UseSuspenseQueryResult } from "@tanstack/react-query"
import { components } from "openapi/schema"
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useState,
} from "react"

export type Language = components["schemas"]["Language"]
export type Problem = components["schemas"]["Problem"]
export type ProblemContext = {
  code: string
  language: Language
  problem: UseSuspenseQueryResult<Problem, undefined>
  setCode: Dispatch<SetStateAction<string>>
  setLanguage: Dispatch<SetStateAction<Language>>
  submissions: UseSuspenseQueryResult<Submission[], undefined>
}

export type ProblemProviderProps = {
  children?: ReactNode
  problemId: number
}

export type Submission = components["schemas"]["Submission"]

export const ProblemProvider: FC<ProblemProviderProps> = ({
  children,
  problemId,
}) => {
  const problem = $api.useSuspenseQuery("get", "/api/problems/{problemId}", {
    params: {
      path: { problemId },
    },
  })
  const submissions = $api.useSuspenseQuery(
    "get",
    "/api/problems/{problemId}/submissions",
    {
      params: {
        path: { problemId: problem.data.id },
      },
    },
  )

  const [language, setLanguage] = useState<Language>(
    problem.data.supported_languages[0],
  )
  const [code, setCode] = useState("")

  return (
    <ProblemContext.Provider
      value={{ code, language, problem, setCode, setLanguage, submissions }}
    >
      {children}
    </ProblemContext.Provider>
  )
}

export const ProblemContext = createContext<ProblemContext | undefined>(
  undefined,
)
