import fs from "node:fs/promises"
import path from "node:path"

const projectRootDir = path.resolve(import.meta.dirname, "../../..")
const backendRootDir = path.resolve(projectRootDir, "backend")

const copyPyodideArtifacts = async () => {
  const rootNodeModulesDir = path.resolve(projectRootDir, "node_modules")
  const backendNodeModulesDir = path.resolve(backendRootDir, "node_modules")

  await fs.symlink(
    path.resolve(rootNodeModulesDir, "pyodide"),
    path.resolve(backendNodeModulesDir, "pyodide"),
    "dir",
  )
}

await copyPyodideArtifacts()
