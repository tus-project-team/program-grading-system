export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCodePoint(...new Uint8Array(buffer)))
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = String.prototype.codePointAt.call(binaryString, i) as number
  }
  return bytes.buffer as ArrayBuffer
}
