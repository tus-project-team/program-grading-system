import { Card } from "@/components/ui/card"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

type Language = {
  name: string
  version: string
}

type Problem = {
  id: number
  supported_languages: Language[]
  test_cases: { input: string; output: string }[]
  title: string
}

// 仮の問題データを使用
const fetchProblems = async (): Promise<Problem[]> => {
  return [
    {
      id: 1,
      supported_languages: [{ name: "Python", version: "3.8" }],
      test_cases: [{ input: "1\n", output: "2\n" }],
      title: "問題1",
    },
    {
      id: 2,
      supported_languages: [{ name: "JavaScript", version: "ES6" }],
      test_cases: [{ input: "2\n", output: "4\n" }],
      title: "問題2",
    },
    // 他の問題も追加可能
  ]
}

const ProblemList = () => {
  const [problems, setProblems] = useState<Problem[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadProblems = async () => {
      const data = await fetchProblems()
      setProblems(data)
    }
    loadProblems()
  }, [])

  // 検索語に基づいて問題をフィルタリング
  const filteredProblems = problems.filter(
    (problem) =>
      problem.title.includes(searchTerm) ||
      problem.id.toString().includes(searchTerm),
  )

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold">問題一覧</h1>

      {/* 検索バー */}
      <input
        className="mb-4 rounded border border-gray-300 p-2"
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="問題IDまたはタイトル"
        type="text"
        value={searchTerm}
      />

      <Card>
        <table className="min-w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                問題ID
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                問題名
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                対応言語
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                テストケース数
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                提出
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem) => (
              <tr className="hover:bg-gray-100" key={problem.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {problem.id}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-blue-500 underline">
                  <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {problem.supported_languages
                    .map((lang) => `${lang.name} (${lang.version})`)
                    .join(", ")}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {problem.test_cases.length}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-blue-500 underline">
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

export const Route = createLazyFileRoute("/problems/")({
  component: ProblemList,
})
