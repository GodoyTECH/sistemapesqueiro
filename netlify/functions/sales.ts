// API de Vendas (PT-BR)
// Rotas:
//  - POST /api/sales -> cria venda completa
//    body = {
//      usuario_id?, comanda_codigo, itens: [{produto_id, quantidade}], desconto_centavos? (opcional)
//    }
// Regras:
//  - Requer caixa aberto (associa venda ao caixa aberto)
//  - Atualiza estoque (decrementa)
//  - Gera movimento de caixa (credito)
//  - Calcula total baseado no preço atual do produto

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

  if (httpMethod === 'POST' && path.endsWith('/sales')) {
    const body = event.body ? JSON.parse(event.body) : {};
    const { usuario_id, comanda_codigo, itens, desconto_centavos } = body;
    if (!Array.isArray(itens) || itens.length === 0) return j(400, { error: 'itens obrigatórios' });
    if (!comanda_codigo) return j(400, { error: 'comanda_codigo é obrigatório' });

    const caixa = await getOpenCash();
    if (!caixa) return j(409, { error: 'nenhum caixa aberto' });

    const venda = await tx(async (s: any) => {
      // garante comanda
      let comanda = (await s`SELECT * FROM comandas WHERE codigo = ${comanda_codigo}`)[0];
      if (!comanda) {
        comanda = (await s`INSERT INTO comandas (codigo, aberta) VALUES (${comanda_codigo}, true) RETURNING *`)[0];
      }

      // carrega preços dos produtos
      const ids = itens.map((i: any) => i.produto_id);
      const produtos = ids.length ? await s`${{ text: `SELECT id, preco_centavos, estoque FROM produtos WHERE id = ANY($1::bigint[])`, values: [ids] }}` : [];
      const mapPreco: Record<number, { preco: number; estoque: number }> = {};
      for (const p of produtos) mapPreco[p.id] = { preco: p.preco_centavos, estoque: p.estoque };

      // calcula total e valida estoque
      let total = 0;
      for (const it of itens) {
        const info = mapPreco[it.produto_id];
        if (!info) throw new Error(`produto ${it.produto_id} não encontrado`);
        if (info.estoque < it.quantidade) throw new Error(`estoque insuficiente do produto ${it.produto_id}`);
        total += info.preco * it.quantidade;
      }
      const desconto = typeof desconto_centavos === 'number' ? desconto_centavos : 0;
      const totalComDesconto = Math.max(total - desconto, 0);

      // cria venda
      const vendaRows = await s`
        INSERT INTO vendas (usuario_id, comanda_id, caixa_id, total_centavos)
        VALUES (${usuario_id || null}, ${comanda.id}, ${caixa.id}, ${totalComDesconto})
        RETURNING *`;
      const venda = vendaRows[0];

      // itens + atualiza estoque
      for (const it of itens) {
        const info = mapPreco[it.produto_id];
        const unit = info.preco;
        const tot = unit * it.quantidade;
        await s`
          INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unit_centavos, total_centavos)
          VALUES (${venda.id}, ${it.produto_id}, ${it.quantidade}, ${unit}, ${tot})`;
        await s`UPDATE produtos SET estoque = estoque - ${it.quantidade} WHERE id = ${it.produto_id}`;
      }

      // movimento de caixa (entrada)
      await s`
        INSERT INTO movimentos_caixa (caixa_id, tipo, descricao, valor_centavos)
        VALUES (${caixa.id}, 'credito', ${'venda ' + venda.id}, ${totalComDesconto})`;

      return venda;
    });

    return j(201, venda);
  }

  return j(404, { error: 'rota não encontrada' });
};

export const handler = withCors(baseHandler);
