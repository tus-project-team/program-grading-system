import type { FC } from "react"

import { PlaygroundProvider } from "../contexts/playground-context-provider"
import { ActionBar } from "./action-bar"
import { Editor } from "./editor"
import { Output } from "./output"

export const Playground: FC = () => {
  return (
    <PlaygroundProvider>
      <div className="flex h-full flex-col gap-4">
        <ActionBar />
        <div className="flex h-full flex-row">
          <Editor />
          <Output />
        </div>
      </div>
    </PlaygroundProvider>
  )
}
