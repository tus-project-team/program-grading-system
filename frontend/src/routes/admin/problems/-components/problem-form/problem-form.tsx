import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MarkdownEditor } from "@/features/markdown-editor"
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { Trash2Icon } from "lucide-react"
import { FC, ReactNode } from "react"
import { z } from "zod"

import { DataTable } from "./data-table"

const problemSchema = z.object({
  body: z.string(),
  supported_languages: z.array(
    z.object({
      name: z.string(),
      version: z.string(),
    }),
  ),
  test_cases: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
    }),
  ),
  title: z.string(),
})

export type ProblemFormProps = {
  children?: ReactNode
  onSubmit: (values: z.infer<typeof problemSchema>) => void
  problem: z.infer<typeof problemSchema>
}

export const ProblemForm: FC<ProblemFormProps> = ({
  children,
  onSubmit,
  problem,
}) => {
  const form = useForm({
    defaultValues: problem,
    onSubmit: (values) => {
      console.log(values.value)
      onSubmit(values.value)
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: problemSchema,
    },
  })

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>問題のタイトル</Label>
            <Input
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              value={field.state.value}
            />
            {/* TODO: Display field info (e.g., validation errors) */}
          </div>
        )}
      </form.Field>
      <form.Field name="body">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>問題文</Label>
            <MarkdownEditor
              className="h-96"
              id={field.name}
              onBlur={field.handleBlur}
              setSource={field.handleChange}
              source={field.state.value}
            />
          </div>
        )}
      </form.Field>
      <div>
        <h2 className="mb-4 text-lg font-semibold">テストケース</h2>
        <form.Field mode="array" name="test_cases">
          {(testCases) => (
            <DataTable
              columns={[
                {
                  accessorKey: "input",
                  cell: ({ row }) => (
                    <form.Field
                      key={row.index}
                      name={`test_cases[${row.index}].input`}
                    >
                      {(field) => (
                        <Textarea
                          className="min-h-fit"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Input"
                          rows={1}
                          value={field.state.value}
                        />
                      )}
                    </form.Field>
                  ),
                  header: "Input",
                },
                {
                  accessorKey: "output",
                  cell: ({ row }) => (
                    <form.Field
                      key={row.index}
                      name={`test_cases[${row.index}].output`}
                    >
                      {(field) => (
                        <Textarea
                          className="min-h-fit"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Expected output"
                          rows={1}
                          value={field.state.value}
                        />
                      )}
                    </form.Field>
                  ),
                  header: "Output",
                },
                {
                  cell: ({ row }) => (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => testCases.removeValue(row.index)}
                            size="icon"
                            type="button"
                            variant="destructive"
                          >
                            <Trash2Icon strokeWidth={2.5} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>テストケースを削除</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ),
                  id: "actions",
                  meta: {
                    className: "w-4",
                  },
                },
              ]}
              data={testCases.state.value}
            >
              <Button
                className="w-full rounded-b-md rounded-t-none border-t"
                onClick={() => testCases.pushValue({ input: "", output: "" })}
                type="button"
                variant="ghost"
              >
                <span className="mr-auto text-muted-foreground">
                  + 新規追加
                </span>
              </Button>
            </DataTable>
          )}
        </form.Field>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          解答可能なプログラミング言語
        </h2>
        <p>WIP</p>
      </div>
      <div className="flex flex-row justify-end">{children}</div>
    </form>
  )
}
