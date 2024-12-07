import { Tabs } from "@/components/ui"
import MonacoEditor from "@monaco-editor/react"
import { type FC, memo } from "react"

import { type Output as OutputType } from "../hooks/use-playground"

type EditorProps = {
  language: string
  value: string
}

const Editor: FC<EditorProps> = memo(({ language, value }) => {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      onMount={(editor) => {
        editor.updateOptions({
          minimap: { enabled: false },
          readOnly: true,
          theme: "vs-dark",
        })
      }}
      value={value}
    />
  )
})
Editor.displayName = "Editor"

export type OutputProps = {
  output: OutputType | undefined
}

export const Output: FC<OutputProps> = memo(({ output }) => {
  return (
    <Tabs className="h-full flex-1 gap-0 border-x-0">
      <Tabs.List className="px-4 pt-2">
        <Tabs.Tab id="output">Output</Tabs.Tab>
        <Tabs.Tab id="ast">AST</Tabs.Tab>
        <Tabs.Tab id="tokens">Tokens</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel className="h-full" id="output">
        <Editor language="plaintext" value={output?.output ?? ""} />
      </Tabs.Panel>
      <Tabs.Panel className="h-full" id="ast">
        <Editor language="json" value={JSON.stringify(output?.ast, null, 2)} />
      </Tabs.Panel>
      <Tabs.Panel className="h-full" id="tokens">
        <Editor
          language="json"
          value={JSON.stringify(output?.tokens, null, 2)}
        />
      </Tabs.Panel>
    </Tabs>
  )
})
Output.displayName = "Output"
