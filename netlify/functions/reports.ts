// API de Relatórios (PT-BR)
// Rotas:
//  - GET /api/reports/sales?from=2025-09-01&to=2025-09-30&group=day|product
//    -> Se group=day: total por dia
//    -> Se group=product: ranking por produto
//
// Dica: chame sem params para últimos 7 dias.

import type { Handler } from '@netlify/functions';
import { withCors } from './_lib/cors';
import { query } from './_lib/db';

const baseHandler: Handler = async (event) => {
  const { httpMethod, path, queryStringParameters } = event;

  if (httpMethod === 'GET' && path.endsWith('/reports/sales')) {
    const from = queryStringParameters?.from;
    const to = queryStringParameters?.to;
    const group = queryStringParameters?.group || 'day';

    const filtro = [];
    if (from) filtro.push(`v.criado_em >= ${from}`);
    if (to) filtro.push(`v.criado_em < (${to}::date + INTERVAL '1 day')`);
    const where = filtro.length ? `WHERE ${filtro.join(' AND ')}` : `WHERE v.criado_em >= now() - INTERVAL '7 days'`;

    if (group === 'product') {
      const rows = await query`${{
        text: `
        SELECT p.id, p.nome, SUM(iv.quantidade) AS quantidade, SUM(iv.total_centavos) AS total_centavos
        FROM vendas v
        JOIN itens_venda iv ON iv.venda_id = v.id
        JOIN produtos p ON p.id = iv.produto_id
        ${where}
        GROUP BY p.id, p.nome
        ORDER BY total_centavos DESC
        `
      }}`;
      return j(200, rows);
    } else {
      const rows = await query`${{
        text: `
        SELECT date_trunc('day', v.criado_em) AS dia, SUM(v.total_centavos) AS total_centavos, COUNT(*) AS num_vendas
        FROM vendas v
        ${where}
        GROUP BY dia
        ORDER BY dia DESC
        `
      }}`;
      return j(200, rows);
    }
  }

  return j(404, { error: 'rota não encontrada' });
};

function j(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export const handler = withCors(baseHandler);
