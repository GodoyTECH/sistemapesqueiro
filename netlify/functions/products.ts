// API de Produtos (PT-BR)
// Rotas:
//  - GET    /api/products               -> lista com filtros simples
//  - POST   /api/products               -> cria produto
//  - PUT    /api/products/:id           -> atualiza produto
//  - DELETE /api/products/:id           -> desativa / deleta (aqui: delete hard para simplificar)
//
// Observação: preços em CENTAVOS (inteiro) e estoque inteiro.

import type { Handler } from '@netlify/functions';
import { withCors } from './_lib/cors';
import { query } from './_lib/db';

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

const baseHandler: Handler = async (event) => {
  const { httpMethod, path, queryStringParameters } = event;

  // --- LISTAR ---
  if (httpMethod === 'GET' && path.endsWith('/products')) {
    const term = (queryStringParameters?.q || '').trim();
    const onlyActive = (queryStringParameters?.active || 'true') === 'true';
    const where = [];
    if (term) where.push(`(nome ILIKE '%' || ${term} || '%' OR codigo_barras = ${term} OR sku = ${term})`);
    if (onlyActive) where.push(`ativo = true`);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = await query`${{ text: `SELECT * FROM produtos ${whereSql} ORDER BY criado_em DESC` }}`;
    return json(200, rows);
  }

  // --- CRIAR ---
  if (httpMethod === 'POST' && path.endsWith('/products')) {
    const body = event.body ? JSON.parse(event.body) : {};
    const { nome, sku, codigo_barras, preco_centavos, estoque } = body;
    if (!nome || typeof preco_centavos !== 'number') return json(400, { error: 'nome e preco_centavos são obrigatórios' });
    const rows = await query`
      INSERT INTO produtos (nome, sku, codigo_barras, preco_centavos, estoque, ativo)
      VALUES (${nome}, ${sku}, ${codigo_barras}, ${preco_centavos}, ${estoque ?? 0}, true)
      RETURNING *`;
    return json(201, rows[0]);
  }

  // --- ATUALIZAR ---
  if (httpMethod === 'PUT' && path.match(/\/products\/\d+$/)) {
    const id = Number(path.split('/').pop());
    const body = event.body ? JSON.parse(event.body) : {};
    const fields = ['nome', 'sku', 'codigo_barras', 'preco_centavos', 'estoque', 'ativo'];
    const sets: string[] = [];
    const values: any[] = [];
    fields.forEach((f) => {
      if (body[f] !== undefined) {
        values.push(body[f]);
        sets.push(`${f} = $${values.length}`);
      }
    });
    if (!sets.length) return json(400, { error: 'nada para atualizar' });
    const sqlText = `UPDATE produtos SET ${sets.join(', ')} WHERE id = $${values.length + 1} RETURNING *`;
    const rows = await query`${{ text: sqlText, values: [...values, id] }}`;
    if (!rows.length) return json(404, { error: 'produto não encontrado' });
    return json(200, rows[0]);
  }

  // --- DELETAR ---
  if (httpMethod === 'DELETE' && path.match(/\/products\/\d+$/)) {
    const id = Number(path.split('/').pop());
    await query`DELETE FROM produtos WHERE id = ${id}`;
    return json(204, null);
  }

  return json(404, { error: 'rota não encontrada' });
};

export const handler = withCors(baseHandler);
