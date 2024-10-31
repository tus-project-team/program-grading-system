import fs from "node:fs/promises"
import path from "node:path"

const projectRootDir = path.resolve(import.meta.dirname, "../../..")
const backendRootDir = path.resolve(projectRootDir, "backend")

const ensureBackendNodeModulesDir = async () => {
  const backendNodeModulesDir = path.resolve(backendRootDir, "node_modules")
  const backendNodeModulesDirStats = await fs
    .stat(backendNodeModulesDir)
    .catch(() => null)
  if (!backendNodeModulesDirStats?.isDirectory()) {
    await fs.mkdir(backendNodeModulesDir)
  }
}

const copyPyodideArtifacts = async () => {
  await fs.symlink(
    path.resolve(projectRootDir, "node_modules", "pyodide"),
    path.resolve(backendRootDir, "node_modules", "pyodide"),
    "dir",
  )
}

await ensureBackendNodeModulesDir()
await copyPyodideArtifacts()
