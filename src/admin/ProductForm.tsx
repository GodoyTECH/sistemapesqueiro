import React, { useState } from 'react';
import { api } from '../lib/api';

function cents(n: string) { return Number(n.replace(/[^\d]/g, '')); }

export default function ProductForm() {
  const [form, setForm] = useState({ nome: '', sku: '', codigo_barras: '', preco: '', estoque: '0' });
  const [saving, setSaving] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome,
          sku: form.sku || null,
          codigo_barras: form.codigo_barras || null,
          preco_centavos: cents(form.preco),
          estoque: Number(form.estoque || 0)
        })
      });
      alert('Produto cadastrado!');
      setForm({ nome: '', sku: '', codigo_barras: '', preco: '', estoque: '0' });
    } catch (err: any) {
      alert(err.message);
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 rounded-2xl shadow bg-white grid gap-3">
      <h2 className="text-xl font-semibold">Cadastro de Produto</h2>
      <input name="nome" value={form.nome} onChange={onChange} placeholder="Nome" className="border rounded px-3 py-2" required />
      <input name="sku" value={form.sku} onChange={onChange} placeholder="SKU (opcional)" className="border rounded px-3 py-2" />
      <input name="codigo_barras" value={form.codigo_barras} onChange={onChange} placeholder="Código de barras (opcional)" className="border rounded px-3 py-2" />
      <input name="preco" value={form.preco} onChange={onChange} placeholder="Preço (ex: 19,90)" className="border rounded px-3 py-2" required />
      <input name="estoque" value={form.estoque} onChange={onChange} placeholder="Estoque inicial" className="border rounded px-3 py-2" />
      <button disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
