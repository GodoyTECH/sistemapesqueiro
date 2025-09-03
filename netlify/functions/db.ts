// Cliente Neon + utilidades (PT-BR)
// - Fornece `sql` (tagged template) e `tx` (transação).
// - Usa NEON_DATABASE_URL ou DATABASE_URL das variáveis de ambiente.

import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error('NEON_DATABASE_URL ou DATABASE_URL não está definido nas variáveis de ambiente');
}

// Cliente serverless
export const sql = neon(url);

// Transação: use assim -> await tx(async (sql) => { ... })
export async function tx<T>(fn: (sql: any) => Promise<T>): Promise<T> {
  // @ts-ignore begin existe no cliente neon
  return await sql.begin(fn);
}

// Query simples (sem transação)
export async function query(strings: TemplateStringsArray, ...values: any[]) {
  // @ts-ignore
  const rows = await sql(strings, ...values);
  return rows;
}
