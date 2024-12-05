import { useState, type FC, type ReactNode } from "react";
import { PlaygroundContext } from "./playground-context";

export type PlaygroundProviderProps = {
  children?: ReactNode;
};

export const PlaygroundProvider: FC<PlaygroundProviderProps> = ({
  children,
}) => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const run = () => {
    // todo: run
    setOutput("Hello, World!");
  };

  return (
    <PlaygroundContext.Provider value={{ code, setCode, output, run }}>
      {children}
    </PlaygroundContext.Provider>
  );
};
