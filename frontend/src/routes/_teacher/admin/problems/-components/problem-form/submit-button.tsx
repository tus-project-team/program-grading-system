import type { FC } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ValidationError } from "@tanstack/react-form"
import { LoaderCircleIcon } from "lucide-react"

export type SubmitButtonProps = {
  canSubmit: boolean
  errors: ValidationError[]
  isSubmitting: boolean
  label: string
  submittingLabel: string
}

export const SubmitButton: FC<SubmitButtonProps> = ({
  canSubmit,
  errors,
  isSubmitting,
  label,
  submittingLabel,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-disabled={!canSubmit}
            className="aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-primary"
            onClick={(e) => {
              if (!canSubmit) {
                e.preventDefault()
              }
            }}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                <span className="ml-2">{submittingLabel}</span>
              </>
            ) : (
              label
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {errors.length > 0 ? (
            <div>
              <span>次のエラーを修正してください：</span>
              <ul className="list-inside list-disc">
                {errors.map((error, index) =>
                  error
                    ?.toString()
                    .split(", ")
                    .map((err, i) => <li key={index + i}>{err}</li>),
                )}
              </ul>
            </div>
          ) : undefined}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
