export const monotonicClock = {
  now() {
    // performance.now() is in milliseconds, but we want nanoseconds
    return BigInt(Math.floor(performance.now() * 1e6))
  },
  resolution() {
    // usually we dont get sub-millisecond accuracy in the browser
    // Note: is there a better way to determine this?
    return 1e6
  },
  subscribeDuration(_duration) {
    _duration = BigInt(_duration)
    console.log(`[monotonic-clock] subscribe`)
  },
  subscribeInstant(instant) {
    instant = BigInt(instant)
    const now = this.now()
    if (instant <= now) return this.subscribeDuration(0)
    return this.subscribeDuration(instant - now)
  },
}

export const wallClock = {
  now() {
    let now = Date.now() // in milliseconds
    const seconds = BigInt(Math.floor(now / 1e3))
    const nanoseconds = (now % 1e3) * 1e6
    return { nanoseconds, seconds }
  },
  resolution() {
    return { nanoseconds: 1e6, seconds: 0n }
  },
}
