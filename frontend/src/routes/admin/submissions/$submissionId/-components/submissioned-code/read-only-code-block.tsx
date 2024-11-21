import MonacoEditor from "@monaco-editor/react"

export const ReadOnlyCodeBlock = ({
  code,
  language,
}: {
  code: string
  language: string
}) => (
  <MonacoEditor
    height="100%"
    language={language}
    options={{
      lineNumbers: "on",
      minimap: { enabled: false },
      readOnly: true,
      scrollBeyondLastLine: false,
    }}
    value={code}
  />
)
