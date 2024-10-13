import { $api } from "@/lib/api"
import { components } from "openapi/schema"
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react"

export type Problem = components["schemas"]["Problem"]
export type Language = components["schemas"]["Language"]

export type ProblemContext = {
  code: string
  language: Language
  problem: components["schemas"]["Problem"]
  setCode: Dispatch<SetStateAction<string>>
  setLanguage: Dispatch<SetStateAction<Language>>
}

export const ProblemContext = createContext<ProblemContext | undefined>(
  undefined,
)

export type ProblemProviderProps = {
  children?: ReactNode
  problemId: number
}

export const ProblemProvider: FC<ProblemProviderProps> = ({
  children,
  problemId,
}) => {
  const { data: problem } = $api.useSuspenseQuery("get", "/api/problems/{id}", {
    params: {
      path: { id: problemId },
    },
  })

  const [language, setLanguage] = useState<Language>(
    problem.supported_languages[0],
  )
  const [code, setCode] = useState("")

  return (
    <ProblemContext.Provider
      value={{ code, language, problem, setCode, setLanguage }}
    >
      {children}
    </ProblemContext.Provider>
  )
}

export const useProblem = () => {
  const context = useContext(ProblemContext)
  if (context === undefined) {
    throw new Error("useProblem must be used within a ProblemProvider")
  }
  return context
}
