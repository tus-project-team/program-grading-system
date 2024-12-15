import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { $api } from "@/lib/api"
import { Link } from "@tanstack/react-router"
import { Book, Code, Languages } from "lucide-react"

export const ProblemList = () => {
  const problems = $api.useSuspenseQuery("get", "/api/problems")

  return (
    <div className="@container">
      <div className="mb-6 grid grid-cols-1 gap-6 @2xl:grid-cols-2">
        {problems.data
          .sort((a, b) => b.id - a.id)
          .filter((_, i) => i < 4)
          .map((problem) => (
            <Card className="flex flex-col" key={problem.id}>
              <CardHeader>
                <CardTitle className="text-xl">{problem.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                  {problem.body}
                </p>
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
                <Button asChild className="w-full">
                  <Link
                    params={{ problemId: problem.id.toString() }}
                    to="/admin/problems/$problemId"
                  >
                    編集
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
      <div className="text-center">
        <Link className="text-blue-600 hover:underline" to="/problems">
          全ての問題を見る
        </Link>
      </div>
    </div>
  )
}
