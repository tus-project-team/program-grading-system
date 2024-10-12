import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react"
import { components } from "openapi/schema"
import { $api } from "@/lib/api"

export type Problem = components["schemas"]["Problem"]
export type Language = components["schemas"]["Language"]

export type ProblemContext = {
  problem: components["schemas"]["Problem"]
  language: Language
  setLanguage: Dispatch<SetStateAction<Language>>
  code: string
  setCode: Dispatch<SetStateAction<string>>
}

export const ProblemContext = createContext<ProblemContext | undefined>(
  undefined,
)

export type ProblemProviderProps = {
  problemId: number
  children?: ReactNode
}

export const ProblemProvider: FC<ProblemProviderProps> = ({
  problemId,
  children,
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
      value={{ problem, language, setLanguage, code, setCode }}
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
