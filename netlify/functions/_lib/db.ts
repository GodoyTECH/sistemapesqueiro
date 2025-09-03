// Cliente simples para Neon (comentários em PT-BR)
// Este arquivo cria uma instância do cliente serverless neon
// e exporta uma função `query` para usar nas functions.
// Antes de usar, defina NEON_DATABASE_URL ou DATABASE_URL nas env vars do Netlify.

import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  // Em produção o Netlify deve conter a variável; em desenvolvimento, pare aqui.
  throw new Error('NEON_DATABASE_URL ou DATABASE_URL não está definido nas variáveis de ambiente');
}

// neon() retorna um cliente que pode ser usado como tagged template:
// await sql`SELECT * FROM usuarios WHERE id = ${id}`;
export const sql = neon(url);

// helper genérico que simplifica chamadas
export async function query(strings: TemplateStringsArray, ...values: any[]) {
  // @ts-ignore - o pacote aceita tagged templates
  const rows = await sql(strings, ...values);
  return rows;
}
