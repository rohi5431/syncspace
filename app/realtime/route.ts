import { upgradeWebSocket } from '@vercel/functions'
import WebSocket from 'ws'

const MAX_PAYLOAD_BYTES = 256 * 1024
const MAX_BUFFERED_BYTES = 1024 * 1024

export const runtime = 'nodejs'

export function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('origin')
  const cookie = request.headers.get('cookie')

  if (!origin || origin !== requestUrl.origin) {
    return new Response('Origin not allowed.', { status: 403 })
  }

  if (!cookie) {
    return new Response('Authentication required.', { status: 401 })
  }

  const apiOrigin = process.env.API_SERVER_URL ?? 'http://localhost:4000'
  const upstreamUrl = new URL('/realtime', apiOrigin)
  upstreamUrl.protocol = upstreamUrl.protocol === 'https:' ? 'wss:' : 'ws:'

  return upgradeWebSocket((client: WebSocket) => {
    const upstream = new WebSocket(upstreamUrl, {
      headers: { cookie },
      maxPayload: MAX_PAYLOAD_BYTES,
      perMessageDeflate: false,
    })
    const pending: Array<{ data: WebSocket.RawData; isBinary: boolean }> = []
    let pendingBytes = 0

    client.on('message', (data, isBinary) => {
      if (payloadSize(data) > MAX_PAYLOAD_BYTES) {
        client.close(1009, 'Message too large.')
        return
      }
      if (upstream.readyState === WebSocket.OPEN) {
        upstream.send(data, { binary: isBinary })
        return
      }
      if (upstream.readyState !== WebSocket.CONNECTING) {
        client.close(1011, 'Realtime service unavailable.')
        return
      }
      pendingBytes += payloadSize(data)
      if (pendingBytes > MAX_BUFFERED_BYTES) {
        client.close(1009, 'Realtime buffer limit exceeded.')
        upstream.terminate()
        return
      }
      pending.push({ data, isBinary })
    })

    upstream.on('open', () => {
      for (const item of pending) upstream.send(item.data, { binary: item.isBinary })
      pending.length = 0
      pendingBytes = 0
    })

    upstream.on('message', (data, isBinary) => {
      if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary })
    })

    upstream.on('close', (code, reason) => {
      if (client.readyState === WebSocket.OPEN) client.close(code, reason.toString())
    })

    upstream.on('error', () => {
      if (client.readyState === WebSocket.OPEN) client.close(1011, 'Realtime service unavailable.')
    })

    client.on('close', () => upstream.close())
    client.on('error', () => upstream.terminate())
  }, { maxPayload: MAX_PAYLOAD_BYTES })
}

function payloadSize(data: WebSocket.RawData): number {
  if (Array.isArray(data)) return data.reduce((total, chunk) => total + chunk.byteLength, 0)
  return data.byteLength
}
