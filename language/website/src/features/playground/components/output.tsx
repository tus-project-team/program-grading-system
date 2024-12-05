import type { FC } from "react";
import { usePlayground } from "../hooks/use-playground";

export const Output: FC = () => {
  const { output } = usePlayground();
  return <div className="h-full flex-1">{output}</div>;
};
