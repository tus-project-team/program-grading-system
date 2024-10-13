import type { FC } from "react"

import { Button } from "@/components/ui/button"
import { $api } from "@/lib/api"

import { useProblem } from "../../-contexts/problem-context/problem-context"

export interface SubmitButtonProps {
  className?: string
}

export const SubmitButton: FC<SubmitButtonProps> = ({ className }) => {
  const { code, language, problem } = useProblem()

  const { isIdle, mutate } = $api.useMutation(
    "post",
    "/api/problems/{id}/submit",
  )

  const submit = () => {
    mutate({
      body: {
        code,
        language,
        problem_id: problem.id,
        student_id: 1, // TODO: Replace with actual student ID from auth
      },
      params: { path: { id: problem.id } },
    })
  }

  return (
    <Button
      className={className}
      disabled={!isIdle}
      onClick={submit}
      type="button"
    >
      提出
    </Button>
  )
}
