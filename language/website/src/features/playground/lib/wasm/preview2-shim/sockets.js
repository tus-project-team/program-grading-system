export const instanceNetwork = {
  instanceNetwork() {
    console.log(`[sockets] instance network`)
  },
}

export const ipNameLookup = {
  dropResolveAddressStream() {},
  nonBlocking() {},
  resolveAddresses() {},
  resolveNextAddress() {},
  setNonBlocking() {},
  subscribe() {},
}

export const network = {
  dropNetwork() {},
}

export const tcpCreateSocket = {
  createTcpSocket() {},
}

export const tcp = {
  accept() {},
  addressFamily() {},
  bind() {},
  connect() {},
  dropTcpSocket() {},
  keepAlive() {},
  listen() {},
  localAddress() {},
  noDelay() {},
  nonBlocking() {},
  receiveBufferSize() {},
  remoteAddress() {},
  sendBufferSize() {},
  setKeepAlive() {},
  setListenBacklogSize() {},
  setNoDelay() {},
  setNonBlocking() {},
  setReceiveBufferSize() {},
  setSendBufferSize() {},
  setUnicastHopLimit() {},
  shutdown() {},
  subscribe() {},
  unicastHopLimit() {},
}

export const udp = {
  addressFamily() {},

  bind() {},

  connect() {},

  dropUdpSocket() {},

  localAddress() {},

  nonBlocking() {},

  receive() {},

  receiveBufferSize() {},

  remoteAddress() {},

  send() {},

  sendBufferSize() {},

  setNonBlocking() {},

  setReceiveBufferSize() {},

  setSendBufferSize() {},

  setUnicastHopLimit() {},

  subscribe() {},

  unicastHopLimit() {},
}

export const udpCreateSocket = {
  createUdpSocket() {},
}
