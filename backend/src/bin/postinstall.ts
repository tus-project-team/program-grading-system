import fs from "node:fs/promises"
import path from "node:path"

const projectRootDir = path.resolve(import.meta.dirname, "../../..")
const backendRootDir = path.resolve(projectRootDir, "backend")

const exists = async (path: string) => {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

const ensureBackendNodeModulesDir = async () => {
  const backendNodeModulesDir = path.resolve(backendRootDir, "node_modules")
  if (!(await exists(backendNodeModulesDir))) {
    await fs.mkdir(backendNodeModulesDir)
  }
}

const copyPyodideArtifacts = async () => {
  const srcDir = path.resolve(projectRootDir, "node_modules", "pyodide")
  const targetDir = path.resolve(backendRootDir, "node_modules", "pyodide")
  const stat = await fs.lstat(targetDir).catch(() => null)
  if (stat?.isSymbolicLink()) {
    return
  }
  await fs.symlink(srcDir, targetDir, "dir")
}

await ensureBackendNodeModulesDir()
await copyPyodideArtifacts()
