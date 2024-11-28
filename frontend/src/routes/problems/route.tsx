// src/routes/problems/route.tsx
import { createFileRoute } from "@tanstack/react-router"

import ProblemList from "./-components/problemlist"
export const Route = createFileRoute("/problems")({
  component: ProblemList,
})
