// Helper de fetch para a API (PT-BR)
// Assume que a API está no mesmo domínio (Netlify) com redirect /api/* -> functions

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
