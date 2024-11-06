import { Card } from "@/components/ui/card"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

type Problem = {
  id: number
  memoryLimit: string
  timeLimit: string
  title: string
}

// 仮の問題データを使用
const fetchProblems = async (): Promise<Problem[]> => {
  return [
    {
      id: 1,
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "問題1",
    },
    {
      id: 2,
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "問題2",
    },
    {
      id: 3,
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "問題3",
    },
    {
      id: 4,
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "問題4",
    },
    {
      id: 5,
      memoryLimit: "256 MB",
      timeLimit: "2 sec",
      title: "問題5",
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
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border border-gray-300 font-semibold">ID</th>
              <th className="py-2 px-4 border border-gray-300 font-semibold">問題名</th>
              <th className="py-2 px-4 border border-gray-300 font-semibold text-right">実行時間制限</th>
              <th className="py-2 px-4 border border-gray-300 font-semibold text-right">メモリ制限</th>
              <th className="py-2 px-4 border border-gray-300 font-semibold">提出</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr className="hover:bg-gray-100" key={problem.id}>
                <td className="py-2 px-4 border border-gray-300">{problem.id}</td>
                <td className="py-2 px-4 border border-gray-300 text-blue-500 underline">
                  <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
                </td>
                <td className="py-2 px-4 border border-gray-300 text-right">{problem.timeLimit}</td>
                <td className="py-2 px-4 border border-gray-300 text-right">{problem.memoryLimit}</td>
                <td className="py-2 px-4 border border-gray-300 text-blue-500 underline">
                  <Link to={`/submit/${problem.id}`}>提出</Link>
                </td>
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
