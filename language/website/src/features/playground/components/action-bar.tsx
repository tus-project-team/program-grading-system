import type { FC } from "react";
import { usePlayground } from "../hooks/use-playground";

export const ActionBar: FC = () => {
  const { run } = usePlayground();

  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={run}>
      Run
    </button>
  );
};
