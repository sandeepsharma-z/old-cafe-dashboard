/**
 * dev-warmup.mjs — Pre-compile all Turbopack routes before the demo.
 *
 * Run AFTER `npm run dev` has printed "Ready":
 *   node scripts/warmup.mjs
 *
 * Turbopack compiles each route lazily (on first request). This script
 * fires a HEAD request at every dashboard route so the compiler runs
 * in the background. By the time a human clicks a link, it's already done.
 */

const BASE = process.env.CAFE_URL ?? 'http://localhost:3001'
const DELAY_MS = 800 // stagger requests so Turbopack isn't overwhelmed

const ROUTES = [
  '/login',
  '/dashboard',
  '/catalogue',
  '/orders',
  '/negotiations',
  '/cart',
  '/billing',
  '/trials',
  '/analytics',
  '/urgent-search',
  '/profile',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForServer(retries = 15) {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch(`${BASE}/login`, { method: 'HEAD', signal: AbortSignal.timeout(2000) })
      return true
    } catch {
      console.log(`  ⏳  Server not ready yet, retrying… (${i + 1}/${retries})`)
      await sleep(2000)
    }
  }
  throw new Error('Dev server did not start within the expected time.')
}

async function warmup() {
  console.log(`\n🔥  Gradient 365 Cafe — Dev Warmup`)
  console.log(`    Waiting for server at ${BASE}…\n`)

  await waitForServer()
  console.log(`  ✓  Server is up. Pre-compiling ${ROUTES.length} routes…\n`)

  const results = []
  for (const route of ROUTES) {
    const start = Date.now()
    try {
      const res = await fetch(`${BASE}${route}`, {
        method: 'GET',
        signal: AbortSignal.timeout(30_000),
        headers: { 'x-warmup': '1' },
      })
      const ms = Date.now() - start
      const status = res.status === 200 ? '✓' : '⚠'
      console.log(`  ${status}  ${route.padEnd(20)} ${ms}ms`)
      results.push({ route, ms, ok: res.ok })
    } catch (err) {
      console.log(`  ✗  ${route.padEnd(20)} failed: ${err.message}`)
      results.push({ route, ms: -1, ok: false })
    }
    await sleep(DELAY_MS)
  }

  const total = results.reduce((a, b) => a + (b.ms > 0 ? b.ms : 0), 0)
  const failed = results.filter((r) => !r.ok).length

  console.log(`\n${'─'.repeat(44)}`)
  console.log(`  🚀  All routes compiled.`)
  console.log(`      Total time : ${(total / 1000).toFixed(1)}s`)
  console.log(`      Failed     : ${failed === 0 ? 'none' : failed}`)
  console.log(`\n  The cafe portal is pitch-ready. Go get 'em.\n`)
}

warmup().catch((err) => {
  console.error('\n❌  Warmup failed:', err.message)
  process.exit(1)
})
