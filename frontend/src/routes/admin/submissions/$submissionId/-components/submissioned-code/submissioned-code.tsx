import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy } from "lucide-react"
import { components } from "openapi/schema"
import { useState } from "react"

import { ReadOnlyCodeBlock } from "./read-only-code-block"

type Submission = components["schemas"]["Submission"]

export const SubmissionedCode = ({
  submission,
}: {
  submission: Submission
}) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(submission.code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>提出されたコード</CardTitle>
        <div className="relative">
          <button
            aria-label="コードをコピー"
            className="absolute right-2 top-2 rounded-md bg-white p-2 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={copyToClipboard}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="h-full overflow-x-auto rounded-md bg-gray-100 p-4">
          <ReadOnlyCodeBlock
            code={submission.code}
            language={submission.language.name.toLowerCase()}
          />
        </div>
      </CardContent>
    </Card>
  )
}
