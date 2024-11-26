import * as React from "react"
import { Button } from "@/components/ui/button"

// 問題データの型定義
type Problem = {
  id: number
  title: string
  description: string
}

// プロパティとして問題のリストを受け取るコンポーネント
type ProblemListProps = {
  problems: Problem[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

const ProblemList: React.FC<ProblemListProps> = ({ problems, onEdit, onDelete }) => {
  return (
    <div className="problem-list space-y-4">
      {problems.map((problem) => (
        <div
          key={problem.id}
          className="flex items-center justify-between p-4 border rounded-md shadow-sm"
        >
          <div>
            <h3 className="text-lg font-medium">{problem.title}</h3>
            <p className="text-sm text-muted-foreground">{problem.description}</p>
          </div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={() => onEdit(problem.id)}>
              編集
            </Button>
            <Button variant="destructive" onClick={() => onDelete(problem.id)}>
              削除
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProblemList
