import { useState, type FC, type ReactNode } from "react";
import { PlaygroundContext } from "./playground-context";

export type PlaygroundProviderProps = {
  children?: ReactNode;
};

export const PlaygroundProvider: FC<PlaygroundProviderProps> = ({
  children,
}) => {
  const [code, setCode] = useState("");

  return (
    <PlaygroundContext.Provider value={{ code, setCode }}>
      {children}
    </PlaygroundContext.Provider>
  );
};
