export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy
    if (proxy) {
      const { ProxyAgent, setGlobalDispatcher } = await import('undici')
      setGlobalDispatcher(new ProxyAgent(proxy))
      console.log(`[instrumentation] Proxy configured: ${proxy}`)
    }
  }
}
