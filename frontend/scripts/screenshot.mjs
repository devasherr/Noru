/**
 * Screenshot a URL after the page has settled, via WebDriver BiDi.
 *
 * `firefox --screenshot` captures on the `load` event, which fires before any
 * script-initiated fetch resolves — so it can only ever photograph loading
 * states. This drives a real session instead and waits before capturing.
 *
 *   node scripts/screenshot.mjs <url> <out.png> [waitMs] [width] [height]
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, out, waitMs = '1500', width = '1440', height = '1000'] = process.argv.slice(2)

if (!url || !out) {
  console.error('usage: node scripts/screenshot.mjs <url> <out.png> [waitMs] [w] [h]')
  process.exit(2)
}

const PORT = 9222
const profile = mkdtempSync(join(tmpdir(), 'noru-ff-'))

const firefox = spawn(
  'firefox',
  [
    '--headless',
    '--no-remote',
    '--profile', profile,
    '--remote-debugging-port', String(PORT),
    '--window-size', `${width},${height}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
)

let socket
let nextId = 1
const pending = new Map()

/** Resolve when the BiDi endpoint starts accepting connections. */
async function connect(deadlineMs = 30_000) {
  const started = Date.now()
  while (Date.now() - started < deadlineMs) {
    try {
      const ws = new WebSocket(`ws://127.0.0.1:${PORT}/session`)
      await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve, { once: true })
        ws.addEventListener('error', reject, { once: true })
      })
      return ws
    } catch {
      await sleep(300)
    }
  }
  throw new Error('BiDi endpoint never came up')
}

function send(method, params = {}) {
  const id = nextId++
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error(`${method} timed out`))
    }, 60_000)
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

try {
  socket = await connect()

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    const slot = pending.get(message.id)
    if (!slot) return
    pending.delete(message.id)
    if (message.type === 'error') slot.reject(new Error(message.message ?? 'BiDi error'))
    else slot.resolve(message.result)
  })

  await send('session.new', { capabilities: {} })

  const { contexts } = await send('browsingContext.getTree', {})
  const context = contexts[0].context

  await send('browsingContext.setViewport', {
    context,
    viewport: { width: Number(width), height: Number(height) },
  })

  await send('browsingContext.navigate', { context, url, wait: 'complete' })

  // The whole point: give React's fetch time to resolve and repaint.
  await sleep(Number(waitMs))

  const { data } = await send('browsingContext.captureScreenshot', { context })
  writeFileSync(out, Buffer.from(data, 'base64'))
  console.log(`wrote ${out}`)
} finally {
  try {
    socket?.close()
  } catch {
    // Already closed.
  }
  firefox.kill('SIGTERM')
}
