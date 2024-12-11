"use client"

import { Progress } from "@/components/ui/progress"
import { FC, useEffect, useState } from "react"

type ProgressData = {
  solvedProblems: number
  totalProblems: number
}

export const ProgressOverview: FC = () => {
  const [progress, setProgress] = useState<ProgressData>({
    solvedProblems: 0,
    totalProblems: 0,
  })

  useEffect(() => {
    // ここで進捗データを取得するAPIを呼び出す
    // 仮のデータを使用
    setProgress({ solvedProblems: 25, totalProblems: 100 })
  }, [])

  const progressPercentage =
    (progress.solvedProblems / progress.totalProblems) * 100

  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span>解いた問題数: {progress.solvedProblems}</span>
        <span>全問題数: {progress.totalProblems}</span>
      </div>
      <Progress className="w-full" value={progressPercentage} />
      <p className="mt-2 text-center">{progressPercentage.toFixed(1)}% 完了</p>
    </div>
  )
}
