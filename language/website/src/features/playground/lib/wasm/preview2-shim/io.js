let id = 0

const symbolDispose = Symbol.dispose || Symbol.for("dispose")

const IoError = class Error {
  constructor(msg) {
    this.msg = msg
  }
  toDebugString() {
    return this.msg
  }
}

/**
 * @typedef {{
 *   read?: (len: BigInt) => Uint8Array,
 *   blockingRead: (len: BigInt) => Uint8Array,
 *   skip?: (len: BigInt) => BigInt,
 *   blockingSkip?: (len: BigInt) => BigInt,
 *   subscribe: () => void,
 *   drop?: () => void,
 * }} InputStreamHandler
 *
 * @typedef {{
 *   checkWrite?: () -> BigInt,
 *   write: (buf: Uint8Array) => BigInt,
 *   blockingWriteAndFlush?: (buf: Uint8Array) => void,
 *   flush?: () => void,
 *   blockingFlush: () => void,
 *   writeZeroes?: (len: BigInt) => void,
 *   blockingWriteZeroes?: (len: BigInt) => void,
 *   blockingWriteZeroesAndFlush?: (len: BigInt) => void,
 *   splice?: (src: InputStream, len: BigInt) => BigInt,
 *   blockingSplice?: (src: InputStream, len: BigInt) => BigInt,
 *   forward?: (src: InputStream) => void,
 *   subscribe?: () => void,
 *   drop?: () => void,
 * }} OutputStreamHandler
 *
 **/

class InputStream {
  /**
   * @param {InputStreamHandler} handler
   */
  constructor(handler) {
    if (!handler) console.trace("no handler")
    this.id = ++id
    this.handler = handler
  }
  blockingRead(len) {
    return this.handler.blockingRead.call(this, len)
  }
  blockingSkip(len) {
    if (this.handler.blockingSkip)
      return this.handler.blockingSkip.call(this, len)
    const bytes = this.handler.blockingRead.call(this, len)
    return BigInt(bytes.byteLength)
  }
  read(len) {
    if (this.handler.read) return this.handler.read(len)
    return this.handler.blockingRead.call(this, len)
  }
  skip(len) {
    if (this.handler.skip) return this.handler.skip.call(this, len)
    if (this.handler.read) {
      const bytes = this.handler.read.call(this, len)
      return BigInt(bytes.byteLength)
    }
    return this.blockingSkip.call(this, len)
  }
  subscribe() {
    console.log(`[streams] Subscribe to input stream ${this.id}`)
  }
  [symbolDispose]() {
    if (this.handler.drop) this.handler.drop.call(this)
  }
}

class OutputStream {
  /**
   * @param {OutputStreamHandler} handler
   */
  constructor(handler) {
    if (!handler) console.trace("no handler")
    this.id = ++id
    this.open = true
    this.handler = handler
  }
  blockingFlush() {
    this.open = true
  }
  blockingSplice(_src, _len) {
    console.log(`[streams] Blocking splice ${this.id}`)
  }
  blockingWriteAndFlush(buf) {
    /// Perform a write of up to 4096 bytes, and then flush the stream. Block
    /// until all of these operations are complete, or an error occurs.
    ///
    /// This is a convenience wrapper around the use of `check-write`,
    /// `subscribe`, `write`, and `flush`, and is implemented with the
    /// following pseudo-code:
    ///
    /// ```text
    /// let pollable = this.subscribe();
    /// while !contents.is_empty() {
    ///     // Wait for the stream to become writable
    ///     poll-one(pollable);
    ///     let Ok(n) = this.check-write(); // eliding error handling
    ///     let len = min(n, contents.len());
    ///     let (chunk, rest) = contents.split_at(len);
    ///     this.write(chunk  );            // eliding error handling
    ///     contents = rest;
    /// }
    /// this.flush();
    /// // Wait for completion of `flush`
    /// poll-one(pollable);
    /// // Check for any errors that arose during `flush`
    /// let _ = this.check-write();         // eliding error handling
    /// ```
    this.handler.write.call(this, buf)
  }
  blockingWriteZeroes(len) {
    this.blockingWrite.call(this, new Uint8Array(Number(len)))
  }
  blockingWriteZeroesAndFlush(len) {
    this.blockingWriteAndFlush.call(this, new Uint8Array(Number(len)))
  }
  checkWrite(len) {
    if (!this.open) return 0n
    if (this.handler.checkWrite) return this.handler.checkWrite.call(this, len)
    return 1_000_000n
  }
  flush() {
    if (this.handler.flush) this.handler.flush.call(this)
  }
  forward(_src) {
    console.log(`[streams] Forward ${this.id}`)
  }
  splice(src, len) {
    const spliceLen = Math.min(len, this.checkWrite.call(this))
    const bytes = src.read(spliceLen)
    this.write.call(this, bytes)
    return bytes.byteLength
  }
  subscribe() {
    console.log(`[streams] Subscribe to output stream ${this.id}`)
  }
  [symbolDispose]() {}
  write(buf) {
    this.handler.write.call(this, buf)
  }
  writeZeroes(len) {
    this.write.call(this, new Uint8Array(Number(len)))
  }
}

export const error = { Error: IoError }

export const streams = { InputStream, OutputStream }

class Pollable {}

function pollList(_list) {
  // TODO
}

function pollOne(_poll) {
  // TODO
}

export const poll = {
  Pollable,
  pollList,
  pollOne,
}
