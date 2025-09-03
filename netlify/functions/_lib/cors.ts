// Middleware CORS simples para Netlify Functions (PT-BR)
// Envolva o handler exportando: export const handler = withCors(myHandler);
// ALLOWED_ORIGINS deve ser definida no painel do Netlify.

import type { HandlerEvent, HandlerContext } from '@netlify/functions';

const DEFAULT_METHODS = 'GET,POST,PUT,DELETE,OPTIONS';

export function withCors(handler: (event: HandlerEvent, context: HandlerContext) => Promise<Response> | Response) {
  return async (event: HandlerEvent, context: HandlerContext) => {
    const origin = (event.headers && (event.headers['origin'] || event.headers['Origin'])) || '';
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const allowOrigin = allowed.length === 0 ? '*' : (allowed.includes(origin) ? origin : allowed[0]);

    if (event.httpMethod === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': DEFAULT_METHODS,
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // Executa handler e assegura headers
    const res = await handler(event, context);
    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', allowOrigin);
    headers.set('Vary', 'Origin');
    return new Response(res.body, { status: res.status, headers });
  };
}
