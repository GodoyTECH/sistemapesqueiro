// API de Comandas (PT-BR)
// Rotas:
//  - POST /api/comandas              -> cria comanda {codigo, cliente_nome?}
//  - GET  /api/comandas/:codigo      -> busca comanda por código
//  - POST /api/comandas/:codigo/fechar -> fecha comanda

import type { Handler } from '@netlify/functions';
import { withCors } from './_lib/cors';
import { query } from './_lib/db';

const baseHandler: Handler = async (event) => {
  const { httpMethod, path } = event;

  if (httpMethod === 'POST' && path.endsWith('/comandas')) {
    const body = event.body ? JSON.parse(event.body) : {};
    const { codigo, cliente_nome } = body;
    if (!codigo) return json(400, { error: 'codigo é obrigatório' });
    const [exists] = await query`SELECT id FROM comandas WHERE codigo = ${codigo}`;
    if (exists) return json(409, { error: 'comanda já existe' });
    const rows = await query`INSERT INTO comandas (codigo, cliente_nome, aberta) VALUES (${codigo}, ${cliente_nome || null}, true) RETURNING *`;
    return json(201, rows[0]);
  }

  if (httpMethod === 'GET' && path.match(/\/comandas\/.+$/)) {
    const codigo = decodeURIComponent(path.split('/').pop()!);
    const rows = await query`SELECT * FROM comandas WHERE codigo = ${codigo}`;
    if (!rows.length) return json(404, { error: 'comanda não encontrada' });
    return json(200, rows[0]);
  }

  if (httpMethod === 'POST' && path.match(/\/comandas\/.+\/fechar$/)) {
    const codigo = decodeURIComponent(path.split('/')[path.split('/').length - 2]);
    const rows = await query`UPDATE comandas SET aberta=false WHERE codigo=${codigo} RETURNING *`;
    if (!rows.length) return json(404, { error: 'comanda não encontrada' });
    return json(200, rows[0]);
  }

  return json(404, { error: 'rota não encontrada' });
};

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export const handler = withCors(baseHandler);
