import { createContext } from "react";

export type Output = {
  tokens: string
  ast: string
  output: string
}

export type PlaygroundContext = {
  code: string;
  setCode: (code: string) => void;
  run: () => Promise<void>;
  output: Output | undefined;
};

export const PlaygroundContext = createContext<PlaygroundContext | undefined>(
  undefined
);
