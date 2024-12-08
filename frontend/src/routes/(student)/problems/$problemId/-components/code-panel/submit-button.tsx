import type { FC } from "react"

import { Button } from "@/components/ui/button"
import { $api } from "@/lib/api"
import { LoaderCircleIcon } from "lucide-react"

import { useProblem } from "../../-hooks/use-problem"

export type SubmitButtonProps = {
  className?: string
}

export const SubmitButton: FC<SubmitButtonProps> = ({ className }) => {
  const { code, language, problem, submissions } = useProblem()

  const { isPending, mutate } = $api.useMutation(
    "post",
    "/api/problems/{problemId}/submit",
    {
      onSettled: () => submissions.refetch(),
    },
  )

  const submit = () => {
    mutate({
      body: {
        code,
        language,
      },
      params: {
        path: { problemId: problem.data.id },
      },
    })
  }

  return (
    <Button
      className={className}
      disabled={isPending}
      onClick={submit}
      type="button"
    >
      {isPending ? (
        <>
          <LoaderCircleIcon className="animate-spin" />
          <span className="ml-2">提出中...</span>
        </>
      ) : (
        "提出"
      )}
    </Button>
  )
}
