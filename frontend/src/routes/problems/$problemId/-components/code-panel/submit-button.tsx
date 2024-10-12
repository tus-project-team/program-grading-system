import { Button } from "@/components/ui/button"

import type { FC } from "react"
import { useProblem } from "../../-contexts/problem-context/problem-context"
import { $api } from "@/lib/api"

export type SubmitButtonProps = {
  className?: string
}

export const SubmitButton: FC<SubmitButtonProps> = ({ className }) => {
  const { problem, code, language } = useProblem()

  const { mutate, isIdle } = $api.useMutation(
    "post",
    "/api/problems/{id}/submit",
  )

  const submit = () => {
    mutate({
      params: { path: { id: problem.id } },
      body: {
        problem_id: problem.id,
        student_id: 1, // TODO: Replace with actual student ID from auth
        code,
        language,
      },
    })
  }

  return (
    <Button type="button" disabled={!isIdle} onClick={submit}>
      提出
    </Button>
  )
}
