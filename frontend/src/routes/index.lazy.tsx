import { Card } from "@/components/ui/card"
import { createLazyFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

type Problem = {
  id: string
  memoryLimit: string
  timeLimit: string
  title: string
}

// 仮の問題データを使用
const fetchProblems = async (): Promise<Problem[]> => {
  return [
    {
      id: "PracticeA",
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "Welcome to AtCoder",
    },
    {
      id: "ABC086A",
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "Product",
    },
    {
      id: "ABC081A",
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "Placing Marbles",
    },
    // 他の問題も追加可能
  ]
}

const ProblemList = () => {
  const [problems, setProblems] = useState<Problem[]>([])

  useEffect(() => {
    const loadProblems = async () => {
      const data = await fetchProblems()
      setProblems(data)
    }
    loadProblems()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">問題一覧</h1>
      <Card>
        <table className="min-w-full bg-white border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border border-gray-300">問題名</th>
              <th className="py-2 px-4 border border-gray-300">実行時間制限</th>
              <th className="py-2 px-4 border border-gray-300">メモリ制限</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id}>
                <td className="py-2 px-4 border border-gray-300">{problem.title}</td>
                <td className="py-2 px-4 border border-gray-300 text-right">{problem.timeLimit}</td>
                <td className="py-2 px-4 border border-gray-300 text-right">{problem.memoryLimit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export const Route = createLazyFileRoute("/")({
  component: ProblemList,
})
