"use client"

import { Progress } from "@/components/ui/progress"
import { $api } from "@/lib/api"
import { FC } from "react"

const STUDENT_ID = 1 // TODO: change this to the actual student ID

type ProgressData = {
  solvedProblems: number
  totalProblems: number
}

export const ProgressOverview: FC = () => {
  const problems = $api.useSuspenseQuery("get", "/api/problems")
  const submissions = $api.useSuspenseQuery("get", "/api/submissions")
  const progress: ProgressData = {
    solvedProblems: submissions.data.filter(
      (submission) =>
        submission.student_id === STUDENT_ID &&
        submission.result.status === "Accepted",
    ).length,
    totalProblems: problems.data.length,
  }

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
