// API de Caixa (PT-BR)
// Rotas:
//  - GET  /api/cash/status          -> caixa atual (se houver) e totais
//  - POST /api/cash/open            -> abre caixa (valor_abertura_centavos, usuario_id)
//  - POST /api/cash/close           -> fecha caixa (valor_fechamento_centavos, usuario_id)
//
// Regra: só pode haver 1 caixa com status 'aberto'.

import type { Handler } from '@netlify/functions';
import { withCors } from './_lib/cors';
import { query, tx } from './_lib/db';

function j(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

async function getOpenCash() {
  const rows = await query`SELECT * FROM caixas WHERE status = 'aberto' ORDER BY aberto_em DESC LIMIT 1`;
  return rows[0];
}

const baseHandler: Handler = async (event) => {
  const { httpMethod, path } = event;

  if (httpMethod === 'GET' && path.endsWith('/cash/status')) {
    const open = await getOpenCash();
    if (!open) return j(200, { aberto: false });
    const [totalCred] = await query`SELECT COALESCE(SUM(valor_centavos),0) AS soma FROM movimentos_caixa WHERE caixa_id = ${open.id} AND tipo = 'credito'`;
    const [totalDeb] = await query`SELECT COALESCE(SUM(valor_centavos),0) AS soma FROM movimentos_caixa WHERE caixa_id = ${open.id} AND tipo = 'debito'`;
    return j(200, {
      aberto: true,
      caixa: open,
      total_credito: totalCred?.soma || 0,
      total_debito: totalDeb?.soma || 0
    });
  }

  if (httpMethod === 'POST' && path.endsWith('/cash/open')) {
    const body = event.body ? JSON.parse(event.body) : {};
    const { valor_abertura_centavos, usuario_id } = body;
    if (typeof valor_abertura_centavos !== 'number') return j(400, { error: 'valor_abertura_centavos é obrigatório (centavos)' });
    const ja = await getOpenCash();
    if (ja) return j(409, { error: 'já existe um caixa aberto' });

    const rows = await query`
      INSERT INTO caixas (aberto_por, valor_abertura_centavos, status)
      VALUES (${usuario_id || null}, ${valor_abertura_centavos}, 'aberto')
      RETURNING *`;
    return j(201, rows[0]);
  }

  if (httpMethod === 'POST' && path.endsWith('/cash/close')) {
    const body = event.body ? JSON.parse(event.body) : {};
    const { valor_fechamento_centavos, usuario_id } = body;

    const open = await getOpenCash();
    if (!open) return j(409, { error: 'nenhum caixa aberto' });

    const closed = await tx(async (s: any) => {
      // totals
      const cred = await s`SELECT COALESCE(SUM(valor_centavos),0) AS soma FROM movimentos_caixa WHERE caixa_id = ${open.id} AND tipo='credito'`;
      const deb = await s`SELECT COALESCE(SUM(valor_centavos),0) AS soma FROM movimentos_caixa WHERE caixa_id = ${open.id} AND tipo='debito'`;
      const total = (cred[0].soma || 0) - (deb[0].soma || 0) + open.valor_abertura_centavos;

      const rs = await s`
        UPDATE caixas SET status='fechado', fechado_por=${usuario_id || null}, fechado_em=now(),
          valor_fechamento_centavos = ${valor_fechamento_centavos ?? total}
        WHERE id=${open.id}
        RETURNING *`;
      return rs[0];
    });

    return j(200, closed);
  }

  return j(404, { error: 'rota não encontrada' });
};

export const handler = withCors(baseHandler);
