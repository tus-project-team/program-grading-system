import type { FC } from "react";
import { Editor } from "./editor";
import { PlaygroundProvider } from "../contexts/playground-context-provider";
import { Output } from "./output";
import { ActionBar } from "./action-bar";

export const Playground: FC = () => {
  return (
    <PlaygroundProvider>
      <div className="flex flex-col h-full">
        <ActionBar />
        <div className="h-full flex flex-row">
          <Editor />
          <Output />
        </div>
      </div>
    </PlaygroundProvider>
  );
};
