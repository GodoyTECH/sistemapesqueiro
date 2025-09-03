// API para reservas (GET lista, POST cria) - comentários em PT-BR
// Usa a mesma função query do db.ts. Simplifiquei a checagem de conflito.

import type { Handler } from '@netlify/functions';
import { withCors } from './_lib/cors';
import { query } from './_lib/db';

const handler: Handler = async (event) => {
  const { httpMethod, path } = event;
  try {
    // GET /api/reservas
    if (httpMethod === 'GET' && path && path.endsWith('/reservas')) {
      const rows = await query`SELECT r.*, t.nome as tanque_nome FROM reservas r JOIN tanques t ON t.id = r.tanque_id ORDER BY r.inicio DESC`;
      return ok(rows);
    }

    // POST /api/reservas
    if (httpMethod === 'POST' && path && path.endsWith('/reservas')) {
      const body = event.body ? JSON.parse(event.body) : {};
      const { usuario_id, tanque_id, inicio, fim } = body;
      if (!usuario_id || !tanque_id || !inicio || !fim) return err(400, 'campos obrigatórios faltando');

      // checagem simples de conflito (intersecção de intervalos)
      const conflitos = await query`SELECT 1 FROM reservas WHERE tanque_id = ${tanque_id} AND NOT (fim <= ${inicio} OR inicio >= ${fim}) LIMIT 1`;
      if (conflitos.length) return err(409, 'janela indisponível');

      const rows = await query`INSERT INTO reservas (usuario_id, tanque_id, inicio, fim) VALUES (${usuario_id}, ${tanque_id}, ${inicio}, ${fim}) RETURNING *`;
      return ok(rows[0], 201);
    }

    return err(404, 'rota não encontrada');
  } catch (e: any) {
    console.error(e);
    return err(500, 'erro interno');
  }
};

const ok = (data: any, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const err = (status: number, message: string) => ok({ error: message }, status);

export const handler = withCors(handler);
