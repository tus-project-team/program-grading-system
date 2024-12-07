import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/classes"
import MonacoEditor from "@monaco-editor/react"
import { type FC, memo } from "react"

export type EditorProps = {
  className?: string
  code: string
  run: () => void
  setCode: (code: string) => void
}

export const Editor: FC<EditorProps> = memo(
  ({ className, code, run, setCode }) => {
    return (
      <div className={cn("relative h-full flex-1", className)}>
        <MonacoEditor
          height="100%"
          language="plaintext"
          onChange={(value) => setCode(value ?? "")}
          onMount={(editor) => {
            editor.updateOptions({
              minimap: { enabled: false },
              theme: "vs-dark",
            })
          }}
          value={code}
        />
        <Button
          appearance="solid"
          className="absolute bottom-4 right-4 font-bold transition"
          onPress={run}
        >
          Run
        </Button>
      </div>
    )
  },
)
Editor.displayName = "Editor"
