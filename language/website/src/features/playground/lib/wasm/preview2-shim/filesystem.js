import { environment } from "./cli.js"
import { streams } from "./io.js"

const { InputStream, OutputStream } = streams

let _cwd = "/"

export function _getFileData() {
  return JSON.stringify(_fileData)
}

export function _setCwd(cwd) {
  _cwd = cwd
}

export function _setFileData(fileData) {
  _fileData = fileData
  _rootPreopen[0] = new Descriptor(fileData)
  const cwd = environment.initialCwd()
  _setCwd(cwd || "/")
}

let _fileData = { dir: {} }

const timeZero = {
  nanoseconds: 0,
  seconds: BigInt(0),
}

class Descriptor {
  #entry
  #mtime = 0
  #stream

  constructor(entry, isStream) {
    if (isStream) this.#stream = entry
    else this.#entry = entry
  }

  _getEntry(descriptor) {
    return descriptor.#entry
  }

  advise(descriptor, offset, length, advice) {
    console.log(`[filesystem] ADVISE`, descriptor, offset, length, advice)
  }

  appendViaStream() {
    console.log(`[filesystem] APPEND STREAM`)
  }

  createDirectoryAt(path) {
    const entry = getChildEntry(this.#entry, path, {
      create: true,
      directory: true,
    })
    if (entry.source) throw "exist"
  }

  getFlags() {
    console.log(`[filesystem] FLAGS FOR`)
  }

  getType() {
    if (this.#stream) return "fifo"
    if (this.#entry.dir) return "directory"
    if (this.#entry.source) return "regular-file"
    return "unknown"
  }

  isSameObject(other) {
    return other === this
  }

  linkAt() {
    console.log(`[filesystem] LINK AT`)
  }

  metadataHash() {
    let upper = BigInt(0)
    upper += BigInt(this.#mtime)
    return { lower: BigInt(0), upper }
  }

  metadataHashAt(_pathFlags, _path) {
    let upper = BigInt(0)
    upper += BigInt(this.#mtime)
    return { lower: BigInt(0), upper }
  }

  openAt(_pathFlags, path, openFlags, _descriptorFlags, _modes) {
    const childEntry = getChildEntry(this.#entry, path, openFlags)
    return new Descriptor(childEntry)
  }

  read(length, offset) {
    const source = getSource(this.#entry)
    return [
      source.slice(offset, offset + length),
      offset + length >= source.byteLength,
    ]
  }

  readDirectory() {
    if (!this.#entry?.dir) throw "bad-descriptor"
    return new DirectoryEntryStream(
      Object.entries(this.#entry.dir).sort(([a], [b]) => (a > b ? 1 : -1)),
    )
  }

  readlinkAt() {
    console.log(`[filesystem] READLINK AT`)
  }

  readViaStream(_offset) {
    const source = getSource(this.#entry)
    let offset = Number(_offset)
    return new InputStream({
      blockingRead(len) {
        if (offset === source.byteLength) throw { tag: "closed" }
        const bytes = source.slice(offset, offset + Number(len))
        offset += bytes.byteLength
        return bytes
      },
    })
  }

  removeDirectoryAt() {
    console.log(`[filesystem] REMOVE DIR AT`)
  }

  renameAt() {
    console.log(`[filesystem] RENAME AT`)
  }

  setSize(size) {
    console.log(`[filesystem] SET SIZE`, size)
  }

  setTimes(dataAccessTimestamp, dataModificationTimestamp) {
    console.log(
      `[filesystem] SET TIMES`,
      dataAccessTimestamp,
      dataModificationTimestamp,
    )
  }

  setTimesAt() {
    console.log(`[filesystem] SET TIMES AT`)
  }

  stat() {
    let size = BigInt(0),
      type = "unknown"
    if (this.#entry.source) {
      type = "regular-file"
      const source = getSource(this.#entry)
      size = BigInt(source.byteLength)
    } else if (this.#entry.dir) {
      type = "directory"
    }
    return {
      dataAccessTimestamp: timeZero,
      dataModificationTimestamp: timeZero,
      linkCount: BigInt(0),
      size,
      statusChangeTimestamp: timeZero,
      type,
    }
  }

  statAt(_pathFlags, path) {
    const entry = getChildEntry(this.#entry, path, {
      create: false,
      directory: false,
    })
    let size = BigInt(0),
      type = "unknown"
    if (entry.source) {
      type = "regular-file"
      const source = getSource(entry)
      size = BigInt(source.byteLength)
    } else if (entry.dir) {
      type = "directory"
    }
    return {
      dataAccessTimestamp: timeZero,
      dataModificationTimestamp: timeZero,
      linkCount: BigInt(0),
      size,
      statusChangeTimestamp: timeZero,
      type,
    }
  }

  symlinkAt() {
    console.log(`[filesystem] SYMLINK AT`)
  }

  sync() {
    console.log(`[filesystem] SYNC`)
  }

  syncData() {
    console.log(`[filesystem] SYNC DATA`)
  }

  unlinkFileAt() {
    console.log(`[filesystem] UNLINK FILE AT`)
  }

  write(buffer, offset) {
    if (offset !== 0) throw "invalid-seek"
    this.#entry.source = buffer
    return buffer.byteLength
  }

  writeViaStream(_offset) {
    const entry = this.#entry
    let offset = Number(_offset)
    return new OutputStream({
      write(buf) {
        const newSource = new Uint8Array(
          buf.byteLength + entry.source.byteLength,
        )
        newSource.set(entry.source, 0)
        newSource.set(buf, offset)
        offset += buf.byteLength
        entry.source = newSource
        return buf.byteLength
      },
    })
  }
}

class DirectoryEntryStream {
  constructor(entries) {
    this.idx = 0
    this.entries = entries
  }
  readDirectoryEntry() {
    if (this.idx === this.entries.length) return null
    const [name, entry] = this.entries[this.idx]
    this.idx += 1
    return {
      name,
      type: entry.dir ? "directory" : "regular-file",
    }
  }
}

function getChildEntry(parentEntry, subpath, openFlags) {
  if (
    subpath === "." &&
    _rootPreopen &&
    descriptorGetEntry(_rootPreopen[0]) === parentEntry
  ) {
    subpath = _cwd
    if (subpath.startsWith("/") && subpath !== "/") subpath = subpath.slice(1)
  }
  let entry = parentEntry
  let segmentIdx
  do {
    if (!entry || !entry.dir) throw "not-directory"
    segmentIdx = subpath.indexOf("/")
    const segment = segmentIdx === -1 ? subpath : subpath.slice(0, segmentIdx)
    if (segment === "..") throw "no-entry"
    if (segment === "." || segment === "");
    else if (!entry.dir[segment] && openFlags.create)
      entry = entry.dir[segment] = openFlags.directory
        ? { dir: {} }
        : { source: new Uint8Array([]) }
    else entry = entry.dir[segment]
    subpath = subpath.slice(segmentIdx + 1)
  } while (segmentIdx !== -1)
  if (!entry) throw "no-entry"
  return entry
}

function getSource(fileEntry) {
  if (typeof fileEntry.source === "string") {
    fileEntry.source = new TextEncoder().encode(fileEntry.source)
  }
  return fileEntry.source
}
const descriptorGetEntry = Descriptor.prototype._getEntry
delete Descriptor.prototype._getEntry

let _preopens = [[new Descriptor(_fileData), "/"]],
  _rootPreopen = _preopens[0]

export const preopens = {
  getDirectories() {
    return _preopens
  },
}

export const types = {
  Descriptor,
  DirectoryEntryStream,
}

export { types as filesystemTypes }
