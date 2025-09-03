// Auth minimal (registro / login) - comentários em PT-BR
// Usa bcryptjs para hash de senha e jsonwebtoken para tokens JWT.
// Este exemplo NÃO tem validação completa; use apenas como base.

import type { Handler } from '@netlify/functions';
import { withCors } from './_lib/cors';
import { query } from './_lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const baseHandler: Handler = async (event) => {
  try {
    const { httpMethod, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    // Rota: POST /api/auth/register
    if (httpMethod === 'POST' && path && path.endsWith('/auth/register')) {
      const { nome, email, senha } = body;
      if (!email || !senha) return resp(400, { error: 'email e senha obrigatórios' });

      const [existente] = await query`SELECT id FROM usuarios WHERE email = ${email}`;
      if (existente) return resp(409, { error: 'email já cadastrado' });

      const hash = await bcrypt.hash(senha, 10);
      const rows = await query`INSERT INTO usuarios (nome, email, senha_hash) VALUES (${nome||''}, ${email}, ${hash}) RETURNING id`;
      return resp(201, { id: rows[0].id });
    }

    // Rota: POST /api/auth/login
    if (httpMethod === 'POST' && path && path.endsWith('/auth/login')) {
      const { email, senha } = body;
      const [user] = await query`SELECT id, senha_hash FROM usuarios WHERE email = ${email}`;
      if (!user) return resp(401, { error: 'credenciais inválidas' });
      const ok = await bcrypt.compare(senha, user.senha_hash);
      if (!ok) return resp(401, { error: 'credenciais inválidas' });
      const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
      return resp(200, { token });
    }

    return resp(404, { error: 'rota não encontrada' });
  } catch (e: any) {
    console.error(e);
    return resp(500, { error: 'erro interno' });
  }
};

function resp(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export const handler = withCors(baseHandler);
