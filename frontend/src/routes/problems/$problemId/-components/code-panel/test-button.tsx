import { Button } from "@/components/ui/button"

import type { FC } from "react"

export type TestButtonProps = {
  className?: string
}

export const TestButton: FC<TestButtonProps> = ({ className }) => {
  const test = () => {
    alert("WIP")
  }

  return (
    <Button variant="outline" onClick={test}>
      テスト実行
    </Button>
  )
}
