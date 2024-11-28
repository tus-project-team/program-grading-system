/* prettier-ignore-start */

/* eslint-disable unicorn/no-abusive-eslint-disable */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from "@tanstack/react-router"

// Import Routes

import { Route as rootRoute } from "./routes/__root"
import { Route as ProblemsRouteImport } from "./routes/problems/route"
import { Route as ProblemsProblemIdRouteImport } from "./routes/problems/$problemId/route"

// Create Virtual Routes

const IndexLazyImport = createFileRoute("/")()
const ProblemsIndexLazyImport = createFileRoute("/problems/")()

// Create/Update Routes

const ProblemsRouteRoute = ProblemsRouteImport.update({
  id: "/problems",
  path: "/problems",
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any).lazy(() => import("./routes/index.lazy").then((d) => d.Route))

const ProblemsIndexLazyRoute = ProblemsIndexLazyImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProblemsRouteRoute,
} as any).lazy(() =>
  import("./routes/problems/index.lazy").then((d) => d.Route),
)

const ProblemsProblemIdRouteRoute = ProblemsProblemIdRouteImport.update({
  id: "/$problemId",
  path: "/$problemId",
  getParentRoute: () => ProblemsRouteRoute,
} as any).lazy(() =>
  import("./routes/problems/$problemId/route.lazy").then((d) => d.Route),
)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/"
      path: "/"
      fullPath: "/"
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    "/problems": {
      id: "/problems"
      path: "/problems"
      fullPath: "/problems"
      preLoaderRoute: typeof ProblemsRouteImport
      parentRoute: typeof rootRoute
    }
    "/problems/$problemId": {
      id: "/problems/$problemId"
      path: "/$problemId"
      fullPath: "/problems/$problemId"
      preLoaderRoute: typeof ProblemsProblemIdRouteImport
      parentRoute: typeof ProblemsRouteImport
    }
    "/problems/": {
      id: "/problems/"
      path: "/"
      fullPath: "/problems/"
      preLoaderRoute: typeof ProblemsIndexLazyImport
      parentRoute: typeof ProblemsRouteImport
    }
  }
}

// Create and export the route tree

interface ProblemsRouteRouteChildren {
  ProblemsProblemIdRouteRoute: typeof ProblemsProblemIdRouteRoute
  ProblemsIndexLazyRoute: typeof ProblemsIndexLazyRoute
}

const ProblemsRouteRouteChildren: ProblemsRouteRouteChildren = {
  ProblemsProblemIdRouteRoute: ProblemsProblemIdRouteRoute,
  ProblemsIndexLazyRoute: ProblemsIndexLazyRoute,
}

const ProblemsRouteRouteWithChildren = ProblemsRouteRoute._addFileChildren(
  ProblemsRouteRouteChildren,
)

export interface FileRoutesByFullPath {
  "/": typeof IndexLazyRoute
  "/problems": typeof ProblemsRouteRouteWithChildren
  "/problems/$problemId": typeof ProblemsProblemIdRouteRoute
  "/problems/": typeof ProblemsIndexLazyRoute
}

export interface FileRoutesByTo {
  "/": typeof IndexLazyRoute
  "/problems/$problemId": typeof ProblemsProblemIdRouteRoute
  "/problems": typeof ProblemsIndexLazyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/": typeof IndexLazyRoute
  "/problems": typeof ProblemsRouteRouteWithChildren
  "/problems/$problemId": typeof ProblemsProblemIdRouteRoute
  "/problems/": typeof ProblemsIndexLazyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: "/" | "/problems" | "/problems/$problemId" | "/problems/"
  fileRoutesByTo: FileRoutesByTo
  to: "/" | "/problems/$problemId" | "/problems"
  id: "__root__" | "/" | "/problems" | "/problems/$problemId" | "/problems/"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  ProblemsRouteRoute: typeof ProblemsRouteRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  ProblemsRouteRoute: ProblemsRouteRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/problems"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/problems": {
      "filePath": "problems/route.tsx",
      "children": [
        "/problems/$problemId",
        "/problems/"
      ]
    },
    "/problems/$problemId": {
      "filePath": "problems/$problemId/route.tsx",
      "parent": "/problems"
    },
    "/problems/": {
      "filePath": "problems/index.lazy.tsx",
      "parent": "/problems"
    }
  }
}
ROUTE_MANIFEST_END */
