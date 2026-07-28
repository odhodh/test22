declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}

declare global {
  type Fetcher = { fetch(request: Request): Promise<Response> };
  interface D1Database {
    prepare(query: string): unknown;
  }
}

export {};
