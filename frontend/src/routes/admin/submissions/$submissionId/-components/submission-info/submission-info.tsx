import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { components } from "openapi/schema"

type Submission = components["schemas"]["Submission"]

export const SubmissionInfo = ({ submission }: { submission: Submission }) => (
  <Card>
    <CardHeader>
      <CardTitle>基本情報</CardTitle>
    </CardHeader>
    <CardContent>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 問題ID */}
        <div>
          <dt className="font-semibold">問題ID</dt>
          <dd>{submission.problem_id}</dd>
        </div>
        {/* 提出ID */}
        <div>
          <dt className="font-semibold">提出ID</dt>
          <dd>{submission.id}</dd>
        </div>
        {/* 提出日時 */}
        <div>
          <dt className="font-semibold">提出日時</dt>
          <dd>{submission.submitted_at}</dd>
        </div>
        {/* 学生ID */}
        <div>
          <dt className="font-semibold">学生ID</dt>
          <dd>{submission.student_id}</dd>
        </div>
        {/* プログラミング言語 */}
        <div>
          <dt className="font-semibold">プログラミング言語</dt>
          <dd>{`${submission.language.name} (${submission.language.version})`}</dd>
        </div>
        {/* 結果 */}
        <div>
          <dt className="font-semibold">全体の結果</dt>
          <dd className="flex items-center">
            {submission.result.status === "Accepted" ? (
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="mr-2 h-5 w-5 text-red-500" />
            )}
            {submission.result.status}
          </dd>
        </div>
      </dl>
    </CardContent>
  </Card>
)
