import MonacoEditor from "@monaco-editor/react";
import type { FC } from "react";
import { cn } from "../../../lib/utils";
import { usePlayground } from "../hooks/use-playground";

export type EditorProps = {
  className?: string;
};

export const Editor: FC<EditorProps> = ({ className }) => {
  const { code, setCode } = usePlayground();

  return (
    <div className={cn("h-full", className)}>
      <MonacoEditor
        height="100%"
        language="plaintext"
        onChange={(value) => setCode(value ?? "")}
        value={code}
      />
    </div>
  );
};
