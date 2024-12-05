import { createContext } from "react";

export type PlaygroundContext = {
  code: string;
  setCode: (code: string) => void;
};

export const PlaygroundContext = createContext<PlaygroundContext | undefined>(
  undefined
);
