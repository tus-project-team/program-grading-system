import { Card } from "@/components/ui/card"
import { createLazyFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

type Problem = {
  id: number
  title: string
}

const fetchProblems = async (): Promise<Problem[]> => {
  return [
    { id: 1, title: "問題1" },
    { id: 2, title: "問題2" },
    { id: 3, title: "問題3" },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {problems.map((problem) => (
          <Card key={problem.id}>
            <div className="p-4">
              <h2 className="text-md font-semibold">ID: {problem.id}</h2>
              <p className="text-sm">タイトル: {problem.title}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Route = createLazyFileRoute("/")({
  component: ProblemList,
})
