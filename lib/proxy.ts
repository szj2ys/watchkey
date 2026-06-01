import type { Dispatcher } from 'undici';

let proxySetup = false;

/**
 * Set up a global proxy dispatcher if HTTPS_PROXY / HTTP_PROXY is configured.
 * Safe to call multiple times; the proxy is applied only once.
 */
export async function setupProxy(): Promise<void> {
  if (proxySetup) return;
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy;
  if (!proxyUrl) return;
  try {
    const { ProxyAgent, setGlobalDispatcher } = await import('undici');
    setGlobalDispatcher(new ProxyAgent(proxyUrl) as Dispatcher);
    proxySetup = true;
  } catch (e) {
    console.warn('[proxy] Failed to set up proxy:', e);
  }
}
