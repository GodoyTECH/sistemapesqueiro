# Instruções para integrar estes helpers ao seu repositório (PT-BR)

1. **O que este ZIP contém**
   - `netlify.toml` — configuração de build e rotas.
   - `netlify/functions/` — funções serverless (auth, reservas) e libs (db, cors).
   - `.env.example` — variáveis de ambiente a configurar no Netlify.

2. **Como adicionar ao seu repositório no GitHub sem alterar o que já funciona**
   - Faça fork do seu repositório (opcional).
   - Crie uma branch nova pelo GitHub web (ex.: `add-netlify-functions`).
   - No GitHub, use o botão **Add file → Upload files** e envie os arquivos/pastas deste ZIP mantendo a estrutura.
   - Commit e abra um Pull Request para a branch `main`.
   - Revise e merge. Isso adicionará apenas novos arquivos; não sobrescreve seus arquivos existentes.

3. **Variáveis de ambiente (netlify)**
   - `DATABASE_URL` ou `NEON_DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (opcional)
   - `ALLOWED_ORIGINS`

4. **SQL inicial (Execute via psql / Neon SQL editor)**
   - Crie as tabelas:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tanques (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  capacidade INT NOT NULL,
  ativo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS reservas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  tanque_id BIGINT REFERENCES tanques(id),
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'ativa',
  criado_em TIMESTAMPTZ DEFAULT now()
);
```

5. **Testes pós-merge**
   - No Netlify, vá em Site settings → Build & deploy e confirme build command (`npm ci && npm run build`) e publish dir (`dist`).
   - Defina as env vars no Netlify.
   - Deploy e use as rotas:
     - `POST /api/auth/register`
     - `POST /api/auth/login`
     - `GET /api/reservas`
     - `POST /api/reservas`

6. **Observações**
   - Os arquivos adicionados foram criados para não modificar nada do frontend — apenas adicionam uma API serverless.
   - Se o seu `package.json` usar `type: commonjs` pode ser necessário ajustar para ESM (ou compilar). Netlify Functions com esbuild suportam ESM.
