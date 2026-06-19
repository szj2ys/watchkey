import type { Dispatcher } from 'undici';

let agent: Dispatcher | undefined;
let initialized = false;

function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy
  );
}

async function ensureAgent(): Promise<Dispatcher | undefined> {
  if (initialized) return agent;
  const proxyUrl = getProxyUrl();
  if (proxyUrl) {
    try {
      const { ProxyAgent } = await import('undici');
      agent = new ProxyAgent(proxyUrl);
      console.log('[proxy] Agent created:', proxyUrl);
    } catch (e) {
      console.warn('[proxy] Failed to create agent:', e);
    }
  }
  initialized = true;
  return agent;
}

// Use undici's native fetch with explicit proxy dispatcher.
// Next.js patches globalThis.fetch for caching, which bypasses undici's
// setGlobalDispatcher. Calling undici.fetch() directly with a dispatcher
// option ensures the proxy is actually used.
export async function proxyFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const a = await ensureAgent();
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (a) {
        const { fetch: undiciFetch } = await import('undici');
        const response = await undiciFetch(url, {
          ...init,
          dispatcher: a,
        } as Parameters<typeof undiciFetch>[1]);
        return response as unknown as Response;
      }
      return fetch(url, init);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const cause = (err instanceof Error && err.cause instanceof Error) ? err.cause.message : '';
      const combined = msg + ' ' + cause;
      const isRetryable = combined.includes('ECONNRESET') || combined.includes('ECONNREFUSED') || combined.includes('ETIMEDOUT');
      if (attempt < maxRetries && isRetryable) {
        const delay = attempt * 1000;
        console.warn(`[proxy] Attempt ${attempt}/${maxRetries} failed (${msg}), retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('proxyFetch: exhausted retries');
}
