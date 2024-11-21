import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { components } from "openapi/schema"
import { useState } from "react"

type Submission = components["schemas"]["Submission"]
type TestCase = components["schemas"]["TestCase"]

export const TestResults = ({
    submission,
    testCases,
}: {
    submission: Submission
    testCases: TestCase[]
}) => {
    const [openIndexes, setOpenIndexes] = useState<boolean[]>(
        submission.test_results.map(() => false),
    )

    const toggleOpen = (index: number) => {
        setOpenIndexes((prev) => {
            const newState = [...prev]
            newState[index] = !newState[index]
            return newState
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>テスト結果</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>テストケースID</TableHead>
                            <TableHead>結果</TableHead>
                            <TableHead>メッセージ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submission.test_results.map((TestResults, index) => (
                            <>
                                <TableRow
                                    className="cursor-pointer hover:bg-gray-100"
                                    key={TestResults.test_case_id}
                                    onClick={() => toggleOpen(index)}
                                >
                                    <TableCell>{TestResults.test_case_id}</TableCell>
                                    <TableCell
                                        className={
                                            TestResults.status === "Passed"
                                                ? "text-green-500"
                                                : "text-red-500"
                                        }
                                    >
                                        {TestResults.status}
                                    </TableCell>
                                    <TableCell>{TestResults.message || "-"}</TableCell>
                                    <TableCell>
                                        {openIndexes[index] ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </TableCell>
                                </TableRow>
                                {openIndexes[index] && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="rounded-md bg-gray-50 p-4">
                                                <h4 className="mb-2 font-semibold">入力:</h4>
                                                <pre className="mb-4 overflow-x-auto rounded-md bg-white p-2">
                                                    <code>
                                                        {testCases[index]?.input || "データがありません"}
                                                    </code>
                                                </pre>
                                                <h4 className="mb-2 font-semibold">正解出力:</h4>
                                                <pre className="overflow-x-auto rounded-md bg-white p-2">
                                                    <code>
                                                        {testCases[index]?.output || "データがありません"}
                                                    </code>
                                                </pre>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
