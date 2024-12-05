import type { FC } from "react";
import { Editor } from "./editor";
import { PlaygroundProvider } from "../contexts/playground-context-provider";

export const Playground: FC = () => {
  return (
    <PlaygroundProvider>
      <div className="h-full">
        <Editor />
      </div>
    </PlaygroundProvider>
  );
};
