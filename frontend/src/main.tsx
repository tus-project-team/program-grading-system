import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App.tsx"
import "./index.css"

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- #root element is always present
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
