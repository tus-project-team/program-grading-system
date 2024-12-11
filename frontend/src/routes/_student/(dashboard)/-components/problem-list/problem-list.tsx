"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { Book, Code, Languages } from "lucide-react"
import { useEffect, useState } from "react"

type Problem = {
  body: string
  id: number
  submitted: boolean
  supported_languages: { name: string; version: string }[]
  test_cases: { input: string; output: string }[]
  title: string
}

export function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([])

  useEffect(() => {
    // ここで問題一覧を取得するAPIを呼び出す
    // 仮のデータを使用
    const fetchedProblems = [
      {
        body: "2つの整数を入力として受け取り、その和を返す関数を実装してください。",
        id: 1,
        submitted: false,
        supported_languages: [
          { name: "Python", version: "3.9" },
          { name: "JavaScript", version: "ES6" },
        ],
        test_cases: [
          { input: "2 3", output: "5" },
          { input: "-1 5", output: "4" },
        ],
        title: "2数の和",
      },
      {
        body: "与えられた文字列を逆順にして返す関数を実装してください。",
        id: 2,
        submitted: true,
        supported_languages: [
          { name: "Java", version: "11" },
          { name: "C++", version: "17" },
        ],
        test_cases: [
          { input: "hello", output: "olleh" },
          { input: "OpenAI", output: "IAnepo" },
        ],
        title: "文字列の逆転",
      },
      {
        body: "与えられた数が素数かどうかを判定する関数を実装してください。",
        id: 3,
        submitted: false,
        supported_languages: [
          { name: "Python", version: "3.9" },
          { name: "JavaScript", version: "ES6" },
          { name: "Java", version: "11" },
        ],
        test_cases: [
          { input: "17", output: "true" },
          { input: "24", output: "false" },
        ],
        title: "素数判定",
      },
    ]

    // 未提出の問題のみをフィルタリング
    setProblems(fetchedProblems.filter((problem) => !problem.submitted))
  }, [])

  return (
    <div className="@container">
      <div className="@2xl:grid-cols-2 mb-6 grid grid-cols-1 gap-6">
        {problems.map((problem) => (
          <Card className="flex flex-col" key={problem.id}>
            <CardHeader>
              <CardTitle>{problem.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="mb-4 text-sm text-gray-600">{problem.body}</p>
              <div className="mb-2 flex items-center space-x-2">
                <Book className="h-4 w-4" />
                <span className="text-sm font-medium">
                  問題 ID: {problem.id}
                </span>
              </div>
              <div className="mb-2 flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">
                  テストケース: {problem.test_cases.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4" />
                <span className="text-sm font-medium">対応言語:</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {problem.supported_languages.map((lang, index) => (
                  <Badge key={index} variant="secondary">
                    {lang.name} ({lang.version})
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">解く</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <Link className="text-blue-600 hover:underline" to="/problems">
          全ての問題を見る（提出済みを含む）
        </Link>
      </div>
    </div>
  )
}
