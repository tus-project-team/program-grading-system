import { createContext } from "react";

export type PlaygroundContext = {
  code: string;
  setCode: (code: string) => void;
  run: () => Promise<void>;
  output: string;
};

export const PlaygroundContext = createContext<PlaygroundContext | undefined>(
  undefined
);
