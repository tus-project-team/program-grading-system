import type { FC } from "react"

export type SubmissionsProps = {
  className?: string
}

export const Submissions: FC<SubmissionsProps> = ({ className }) => {
  return <div className={className}></div>
}
