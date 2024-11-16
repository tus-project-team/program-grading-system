import { Button } from "@/components/ui/button"
import { LoaderCircleIcon } from "lucide-react"
import { ComponentPropsWithoutRef, FC } from "react"

export type SubmitButtonProps = {
  label: string
  submitting: boolean
  submittingLabel: string
} & ComponentPropsWithoutRef<"button">

export const SubmitButton: FC<SubmitButtonProps> = ({
  label,
  submitting,
  submittingLabel,
  ...props
}) => {
  return (
    <Button type="submit" {...props}>
      {submitting ? (
        <>
          <LoaderCircleIcon className="animate-spin" />
          <span className="ml-2">{submittingLabel}</span>
        </>
      ) : (
        label
      )}
    </Button>
  )
}
