import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ReportPage() {
  const [byDay, setByDay] = useState<any[]>([]);
  const [byProduct, setByProduct] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const day = await api('/api/reports/sales?group=day');
      const prod = await api('/api/reports/sales?group=product');
      setByDay(day);
      setByProduct(prod);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-6">
      <div className="p-4 rounded-2xl shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Vendas por dia (últimos 7 dias)</h2>
        {loading && <div>Carregando...</div>}
        {!loading && (
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Dia</th><th className="text-right">Total</th><th className="text-right"># Vendas</th></tr></thead>
            <tbody>
              {byDay.map((r, i) => (
                <tr key={i} className="border-t">
                  <td>{new Date(r.dia).toLocaleDateString('pt-BR')}</td>
                  <td className="text-right">{centsToBRL(r.total_centavos)}</td>
                  <td className="text-right">{r.num_vendas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 rounded-2xl shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">Ranking de produtos</h2>
        {!loading && (
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Produto</th><th className="text-right">Qtd</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {byProduct.map((r, i) => (
                <tr key={i} className="border-t">
                  <td>{r.nome}</td>
                  <td className="text-right">{r.quantidade}</td>
                  <td className="text-right">{centsToBRL(r.total_centavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
