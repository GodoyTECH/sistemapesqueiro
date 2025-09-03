import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

// Componente simples para usar na página de Admin.
// Mostra status do caixa, permite abrir e fechar.
// Valores em reais: convertemos centavos <-> reais no UI.

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function brlToCents(v: string) {
  const x = v.replace(/[^\d]/g, '');
  return Number(x);
}

export default function OpenCashBox() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [valorAbertura, setValorAbertura] = useState('');
  const [valorFechamento, setValorFechamento] = useState('');

  async function load() {
    setLoading(true);
    try {
      const s = await api('/api/cash/status');
      setStatus(s);
    } finally {
      setLoading(false);
    }
  }

  async function abrir() {
    setLoading(true);
    try {
      await api('/api/cash/open', {
        method: 'POST',
        body: JSON.stringify({ valor_abertura_centavos: brlToCents(valorAbertura) })
      });
      setValorAbertura('');
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  async function fechar() {
    setLoading(true);
    try {
      await api('/api/cash/close', {
        method: 'POST',
        body: JSON.stringify({ valor_fechamento_centavos: brlToCents(valorFechamento) })
      });
      setValorFechamento('');
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 rounded-2xl shadow bg-white space-y-4">
      <h2 className="text-xl font-semibold">Caixa</h2>

      {loading && <div>Carregando...</div>}

      {!loading && status?.aberto === false && (
        <div className="space-y-2">
          <div className="text-gray-600">Nenhum caixa aberto</div>
          <input
            value={valorAbertura}
            onChange={e => setValorAbertura(e.target.value)}
            placeholder="Valor de abertura (ex: 100,00)"
            className="border rounded px-3 py-2 w-full"
          />
          <button
            onClick={abrir}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Abrir caixa
          </button>
        </div>
      )}

      {!loading && status?.aberto && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Aberto em: {new Date(status.caixa.aberto_em).toLocaleString('pt-BR')}</div>
          <div className="text-sm">Abertura: {centsToBRL(status.caixa.valor_abertura_centavos)}</div>
          <div className="text-sm">Créditos: {centsToBRL(status.total_credito || 0)}</div>
          <div className="text-sm">Débitos: {centsToBRL(status.total_debito || 0)}</div>

          <input
            value={valorFechamento}
            onChange={e => setValorFechamento(e.target.value)}
            placeholder="Valor de fechamento (opcional, ex: 250,00)"
            className="border rounded px-3 py-2 w-full"
          />
          <button
            onClick={fechar}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Fechar caixa
          </button>
        </div>
      )}
    </div>
  );
}
