import type { FC } from "react"

import { usePlayground } from "../hooks/use-playground"

export const ActionBar: FC = () => {
  const { run } = usePlayground()

  return (
    <button className="rounded bg-blue-500 px-4 py-2 text-white" onClick={run}>
      Run
    </button>
  )
}
