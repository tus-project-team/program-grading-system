import { useState, type FC, type ReactNode } from "react";
import { PlaygroundContext } from "./playground-context";
import { run as runWasmComponent } from "../lib/wasm";
import { getAst, getTokens } from "../../../../generated/tools/tools";

export type PlaygroundProviderProps = {
  children?: ReactNode;
};

export const PlaygroundProvider: FC<PlaygroundProviderProps> = ({
  children,
}) => {
  const [code, setCode] = useState("fn main () -> i32 { 0 }");
  const [output, setOutput] = useState("");

  const run = async () => {
    const ast = getAst(code);
    console.log(ast);
    setOutput("Hello, World!");
  };

  return (
    <PlaygroundContext.Provider value={{ code, setCode, output, run }}>
      {children}
    </PlaygroundContext.Provider>
  );
};
