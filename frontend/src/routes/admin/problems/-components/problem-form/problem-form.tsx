import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MarkdownEditor } from "@/features/markdown-editor"
import { zodResolver } from "@hookform/resolvers/zod"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2Icon } from "lucide-react"
import { components } from "openapi/schema"
import { FC, ReactNode } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { DataTable } from "./data-table"

type TestCase = components["schemas"]["TestCase"]

const formSchema = z.object({
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
  onSubmit: (values: z.infer<typeof formSchema>) => void
  problem: z.infer<typeof formSchema>
}

export const ProblemForm: FC<ProblemFormProps> = ({
  children,
  onSubmit,
  problem,
}) => {
  const testCasesColumns: ColumnDef<TestCase>[] = [
    {
      accessorKey: "input",
      cell: ({ row }) => (
        <Textarea
          className="min-h-fit"
          placeholder="Input"
          rows={1}
          {...form.register(`test_cases.${row.index}.input`)}
        />
      ),
      header: "Input",
    },
    {
      accessorKey: "output",
      cell: ({ row }) => (
        <Textarea
          className="min-h-fit"
          placeholder="Expected output"
          rows={1}
          {...form.register(`test_cases.${row.index}.output`)}
        />
      ),
      header: "Output",
    },
    {
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => testCases.remove(row.index)}
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
      size: 5,
    },
  ]

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: problem,
    resolver: zodResolver(formSchema),
  })

  const testCases = useFieldArray({
    control: form.control,
    name: "test_cases",
  })

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="問題のタイトル" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>問題文</FormLabel>
              <FormControl>
                <MarkdownEditor
                  className="h-96"
                  defaultSource={field.value}
                  onChangeSource={(source) => form.setValue("body", source)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div>
          <h2 className="mb-4 text-lg font-semibold">テストケース</h2>
          <DataTable columns={testCasesColumns} data={testCases.fields}>
            <Button
              className="w-full rounded-b-md rounded-t-none border-t"
              onClick={() => testCases.append({ input: "", output: "" })}
              type="button"
              variant="ghost"
            >
              <span className="mr-auto text-muted-foreground">+ 新規追加</span>
            </Button>
          </DataTable>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            解答可能なプログラミング言語
          </h2>
          <p>WIP</p>
        </div>
        <div className="flex flex-row justify-end">{children}</div>
      </form>
    </Form>
  )
}
