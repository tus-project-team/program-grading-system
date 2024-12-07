/**
 * @param {import("../../types/interfaces/wasi-http-types").Request} req
 * @returns {string}
 */
export function send(req) {
  console.log(`[http] Send (browser) ${req.uri}`)
  try {
    const xhr = new XMLHttpRequest()
    xhr.open(req.method.toString(), req.uri, false)
    const requestHeaders = new Headers(req.headers)
    for (let [name, value] of requestHeaders.entries()) {
      if (name !== "user-agent" && name !== "host") {
        xhr.setRequestHeader(name, value)
      }
    }
    xhr.send(req.body && req.body.length > 0 ? req.body : null)
    const body = xhr.response
      ? new TextEncoder().encode(xhr.response)
      : undefined
    const headers = []
    for (const line of xhr
      .getAllResponseHeaders()
      .trim()
      .split(/[\n\r]+/)) {
      var parts = line.split(": ")
      var key = parts.shift()
      var value = parts.join(": ")
      headers.push([key, value])
    }
    return {
      body,
      headers,
      status: xhr.status,
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

export const incomingHandler = {
  handle() {},
}

export const outgoingHandler = {
  handle() {},
}

export const types = {
  dropFields(_fields) {
    console.log("[types] Drop fields")
  },
  dropFutureIncomingResponse(_f) {
    console.log("[types] Drop future incoming response")
  },
  dropIncomingRequest(_req) {
    console.log("[types] Drop incoming request")
  },
  dropIncomingResponse(_res) {
    console.log("[types] Drop incoming response")
  },
  dropOutgoingRequest(_req) {
    console.log("[types] Drop outgoing request")
  },
  dropOutgoingResponse(_res) {
    console.log("[types] Drop outgoing response")
  },
  dropResponseOutparam(_res) {
    console.log("[types] Drop response outparam")
  },
  fieldsAppend(_fields, _name, _value) {
    console.log("[types] Fields append")
  },
  fieldsClone(_fields) {
    console.log("[types] Fields clone")
  },
  fieldsDelete(_fields, _name) {
    console.log("[types] Fields delete")
  },
  fieldsEntries(_fields) {
    console.log("[types] Fields entries")
  },
  fieldsGet(_fields, _name) {
    console.log("[types] Fields get")
  },
  fieldsSet(_fields, _name, _value) {
    console.log("[types] Fields set")
  },
  finishIncomingStream(s) {
    console.log(`[types] Finish incoming stream ${s}`)
  },
  finishOutgoingStream(s, _trailers) {
    console.log(`[types] Finish outgoing stream ${s}`)
  },
  futureIncomingResponseGet(_f) {
    console.log("[types] Future incoming response get")
  },
  incomingRequestAuthority(_req) {
    console.log("[types] Incoming request authority")
  },
  incomingRequestConsume(_req) {
    console.log("[types] Incoming request consume")
  },
  incomingRequestHeaders(_req) {
    console.log("[types] Incoming request headers")
  },
  incomingRequestMethod(_req) {
    console.log("[types] Incoming request method")
  },
  incomingRequestPathWithQuery(_req) {
    console.log("[types] Incoming request path with query")
  },
  incomingRequestScheme(_req) {
    console.log("[types] Incoming request scheme")
  },
  incomingResponseConsume(_res) {
    console.log("[types] Incoming response consume")
  },
  incomingResponseHeaders(_res) {
    console.log("[types] Incoming response headers")
  },
  incomingResponseStatus(_res) {
    console.log("[types] Incoming response status")
  },
  listenToFutureIncomingResponse(_f) {
    console.log("[types] Listen to future incoming response")
  },
  newFields(_entries) {
    console.log("[types] New fields")
  },
  newOutgoingRequest(_method, _pathWithQuery, _scheme, _authority, _headers) {
    console.log("[types] New outgoing request")
  },
  newOutgoingResponse(_statusCode, _headers) {
    console.log("[types] New outgoing response")
  },
  outgoingRequestWrite(_req) {
    console.log("[types] Outgoing request write")
  },
  outgoingResponseWrite(_res) {
    console.log("[types] Outgoing response write")
  },
  setResponseOutparam(_response) {
    console.log("[types] Drop fields")
  },
}
