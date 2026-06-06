// Polyfill Web APIs needed by Next.js in jsdom environment
// This file runs BEFORE any module imports (via jest.config setupFiles)

class HeadersPolyfill {
  private _map = new Map<string, string>();
  constructor(init?: Record<string, string> | HeadersPolyfill) {
    if (init) {
      if (init instanceof HeadersPolyfill) {
        init.forEach((v, k) => this._map.set(k.toLowerCase(), v));
      } else {
        Object.entries(init).forEach(([k, v]) => this._map.set(k.toLowerCase(), v));
      }
    }
  }
  get(name: string) { return this._map.get(name.toLowerCase()) ?? null; }
  set(name: string, value: string) { this._map.set(name.toLowerCase(), String(value)); }
  has(name: string) { return this._map.has(name.toLowerCase()); }
  delete(name: string) { this._map.delete(name.toLowerCase()); }
  append(name: string, value: string) {
    const existing = this._map.get(name.toLowerCase());
    this._map.set(name.toLowerCase(), existing ? `${existing}, ${value}` : String(value));
  }
  forEach(callback: (value: string, key: string) => void) {
    this._map.forEach((v, k) => callback(v, k));
  }
  entries() { return this._map.entries(); }
  keys() { return this._map.keys(); }
  values() { return this._map.values(); }
  [Symbol.iterator]() { return this._map[Symbol.iterator](); }
}

class ResponsePolyfill {
  status: number;
  statusText: string;
  headers: HeadersPolyfill;
  body: any;
  ok: boolean;
  url: string;
  type: string;
  redirected: boolean;

  constructor(body?: any, init?: any) {
    this.status = init?.status ?? 200;
    this.statusText = init?.statusText ?? '';
    this.headers = init?.headers instanceof HeadersPolyfill
      ? init.headers
      : new HeadersPolyfill(init?.headers);
    this.body = body;
    this.ok = this.status >= 200 && this.status < 300;
    this.url = '';
    this.type = 'basic';
    this.redirected = false;
  }

  async json() {
    const text = typeof this.body === 'string' ? this.body : await this.body;
    return JSON.parse(text);
  }

  async text() {
    return typeof this.body === 'string' ? this.body : String(this.body);
  }

  clone() {
    return new ResponsePolyfill(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    });
  }

  static json(data: any, init?: any) {
    const headers = new HeadersPolyfill(init?.headers);
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    return new ResponsePolyfill(JSON.stringify(data), {
      ...init,
      headers,
    });
  }
}

if (typeof globalThis.Headers === 'undefined') {
  (globalThis as any).Headers = HeadersPolyfill;
}

if (typeof globalThis.Request === 'undefined') {
  (globalThis as any).Request = class Request {
    url: string;
    method: string;
    body: any;
    headers: HeadersPolyfill;
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.body = init?.body;
      this.headers = init?.headers instanceof HeadersPolyfill
        ? init.headers
        : new HeadersPolyfill(init?.headers);
    }
    async json() { return JSON.parse(this.body); }
  };
}

if (typeof globalThis.Response === 'undefined') {
  (globalThis as any).Response = ResponsePolyfill;
}
