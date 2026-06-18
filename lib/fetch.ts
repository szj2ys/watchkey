// Proxy-aware fetch for libraries that accept a custom fetch function
// (e.g. @supabase/supabase-js, youtube-transcript).
// Uses undici's ProxyAgent when HTTPS_PROXY / HTTP_PROXY is set.

import type { Dispatcher } from 'undici';

let agent: Dispatcher | undefined;
let resolved = false;

function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy
  );
}

async function getAgent(): Promise<Dispatcher | undefined> {
  if (resolved) return agent;
  const proxyUrl = getProxyUrl();
  if (proxyUrl) {
    try {
      const { ProxyAgent } = await import('undici');
      agent = new ProxyAgent(proxyUrl);
    } catch {
      // undici not available — fall through to plain fetch
    }
  }
  resolved = true;
  return agent;
}

export async function fetchWithProxy(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const a = await getAgent();
  if (a) {
    const { fetch: undiciFetch } = await import('undici');
    return undiciFetch(input as string, {
      ...init,
      dispatcher: a,
    } as Parameters<typeof undiciFetch>[1]) as unknown as Promise<Response>;
  }
  return fetch(input, init);
}
