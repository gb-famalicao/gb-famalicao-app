# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral
App de gestão de presença para academia de Jiu-Jitsu Gracie Barra, com três experiências:
1. **App do aluno** — login, perfil com faixa/graus, gerar QR Code de presença, histórico, avisos, turmas, aulas
2. **App do tablet** — roda na academia com câmera aberta lendo QR Codes (`/tablet`)
3. **Painel admin/professor** — dashboard, CRUD de alunos, faixas/graus, turmas, avisos, galeria (`/admin`)

---

## Comandos

```bash
npm run dev      # servidor local em http://localhost:3000
npm run build    # build de produção (detecta erros de tipo e lint)
npm run lint     # ESLint
```

Não há testes automatizados no projeto.

---

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + Storage + RLS)
- `qrcode` (gerar QR) + `@zxing/browser` (ler QR — carregado via `import()` dinâmico com `ssr: false` em Client Components)
- Deploy: Vercel

---

## Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=https://fjqiyilzxxyoyposqsfz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_3wPqhs8SFm2_dvKrH_99Jw_8Nt2tIVR
SUPABASE_SERVICE_ROLE_KEY=<somente em .env.local, nunca expor ao cliente>
```

---

## Arquitetura

### Clientes Supabase (três variantes)
- [`src/lib/supabase/client.ts`](src/lib/supabase/client.ts) — `createBrowserClient` para componentes `"use client"`
- [`src/lib/supabase/server.ts`](src/lib/supabase/server.ts) — `createServerClient` para Server Components e Server Actions (anon key, respeita RLS)
- [`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts) — `createClient` com `service_role` key, **apenas server-side**, ignora RLS; usar para mutations admin e queries de dashboard

### Autenticação e rotas protegidas
O middleware ([`src/middleware.ts`](src/middleware.ts)) delega para [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts) que:
- Redireciona usuários não autenticados para `/login` (ou `/tablet/login` se o path começa com `/tablet`)
- Paths públicos: `/login`, `/cadastro`, `/tablet/login`
- Usuários autenticados em `/login` ou `/cadastro` são redirecionados para `/perfil`

O layout [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) verifica adicionalmente `profile.perfil === "admin" | "professor"`, redirecionando outros para `/perfil`.

### Padrão de página (Server Component + View/Form Client Component)
Pages (`page.tsx`) são Server Components que buscam dados e passam para componentes client (`*View.tsx`, `*Form.tsx`). Server Actions ficam em arquivos separados `*-actions.ts` com diretiva `"use server"`.

Server Actions seguem o padrão de retorno `{ ok: boolean; erro?: string; ... }` e chamam `revalidatePath()` após mutations.

Mutations admin usam `createAdminClient()` (service_role) para contornar RLS. Verificação de autenticação do usuário corrente usa `createClient()` (server) em paralelo.

### Fluxo de presença via QR Code
1. Aluno chama RPC `gerar_qr_token()` → retorna `{ token, expira_em }` (60s de validade)
2. App do aluno renderiza o QR e faz polling na tabela `presencas` a cada 2,5s para detectar registro
3. Tablet usa `@zxing/browser` para leitura contínua da câmera e chama RPC `registrar_presenca_por_token(p_token)`
4. Tablet exibe tela de confirmação com nome, foto e faixa do aluno após registro bem-sucedido
5. Presença única por aluno por dia garantida por índice único na tabela `presencas`
6. Bloqueio de re-registro: verifica se existe presença nas últimas 1h (via RPC)
7. **Bloqueio financeiro:** RPC verifica `data_vencimento_mensalidade` — rejeita QR se mensalidade vencida há mais de X dias (configurável), retornando mensagem específica ao aluno

### Banco de dados
Tabelas: `profiles`, `presencas`, `qr_tokens`, `avisos`, `albuns`, `fotos`, `historico_graduacoes`, `mensalidades`, `turmas`, `aulas`, `reservas`

RPCs:
- `gerar_qr_token()` — gera token temporário de 60s
- `registrar_presenca_por_token(p_token)` — valida token, verifica situação financeira, registra presença
- `limpar_tokens_expirados()` — manutenção periódica

Trigger no Supabase cria `profile` automaticamente no signup. Todos os tipos TypeScript estão em [`src/lib/types.ts`](src/lib/types.ts).

### Cores e design
Variáveis Tailwind customizadas (prefixo `gb-`):
- `gb-blue` → `#CC0000` (vermelho Gracie Barra — o nome é histórico)
- `gb-blue-dark` → `#990000`
- `gb-black` → `#0A0A0A`
- `gb-gray` → `#F5F5F5` (background padrão)

Fonte: Inter. Interface em pt-BR. Código React em inglês. Mobile-first.

---

## Padrões

- Admin dashboard usa `createAdminClient()` diretamente no Server Component para queries batch paralelas com `Promise.all()`
- Componentes `FaixaBJJ` e `FaixaBelt` em [`src/components/`](src/components/) renderizam a faixa com graus visualmente
- shadcn/ui primitivos em [`src/components/ui/`](src/components/ui/)
- `import()` dinâmico com `ssr: false` **apenas em Client Components**, nunca em Server Components
- A `service_role` key nunca deve aparecer em código client-side nem ser commitada
- Locale: pt-PT (Portugal) — moeda em euros (€), telefone com prefixo +351, datas em formato pt-PT
- UI polishing é deliberadamente adiado para a Fase 15 — foco em funcionalidade primeiro

---

## Regras críticas (aprendidas em produção)

| Problema | Solução |
|---|---|
| Queries admin retornando vazio | Usar `createAdminClient()` (service_role), não o client de sessão — RLS bloqueia |
| Câmera não funciona no tablet | HTTPS obrigatório — HTTP bloqueia acesso à câmera |
| `@zxing/browser` quebrando SSR | `dynamic(() => import(...), { ssr: false })` apenas em Client Components |
| `pgcrypto` não disponível | Extensão deve ser habilitada explicitamente no Supabase |
| UIDs do Supabase em SQL | Requerem aspas simples corretas — verificar quoting |

---

## Roadmap de fases

### ✅ Concluídas

**Fase 1 — Auth + Perfil**
Login, cadastro, redirecionamento pós-login, página de perfil. Fix: hydration error, auth callback route, TypeScript CSS fix.

**Fase 2 — QR Code Presença (base)**
Rotas `/presenca`, `/tablet`, `/tablet/login`. Acesso ao tablet restrito a `perfil = 'tablet'`.

**Fase 3 — Fluxo QR completo**
Geração de QR com cooldown de 1h, leitura pelo tablet, polling no app do aluno, tela verde de confirmação. Foto do aluno exibida no tablet após scan.

**Fase 4 — Perfil completo do aluno**
Upload de foto para Supabase Storage (bucket `avatars`), edição de dados pessoais, histórico de presenças com filtro por mês, calendário visual marcando dias de treino, resumo mensal.

**Fase 5 — Painel admin**
CRUD de alunos (cadastrar, editar, inativar), lista com filtros (status, faixa, categoria), visualizar presenças de qualquer aluno, busca por nome.

**Fase 6 — Gestão financeira**
Campo `data_vencimento_mensalidade` no perfil, status financeiro automático (em dia / vence em breve / atrasado), visão admin com situação de todos os alunos. Fix: bug de infinite loading. Página `/admin/financeiro` com filtros (aluno, mês, status), marcar/desmarcar pago.

**Fase 7 — Turmas e reservas**
Tabelas `turmas`, `aulas`, `reservas`. Vista semanal em `/aulas` com tabs por dia, vagas em tempo real, reservar/cancelar. Admin: CRUD de turmas, geração de aulas (semanal, diária seg-sex, quinzenal, mensal, personalizado/avulsa), gestão de reservas por aula. RPC modificado: QR rejeitado se não houver reserva confirmada para hoje. Recorrência diária gera seg-sex apenas.

**Fase 8 — Graduações**
Admin regista promoção de faixa/grau em `/admin/alunos/[id]` — modal com nova faixa, graus, observações. Atualiza `profiles` e insere em `historico_graduacoes`. Timeline visual no perfil do aluno (read-only). Componente `FaixaBJJ` atualizado para usar imagens `.webp` das pastas `/img/adulto/` e `/img/infantil/`, mapeando enum → nome de ficheiro correto (incluindo `roxa` → `roxo`). Sistema de faixas infantis: branca, cinza/branca, cinza, cinza/preta, amarela/branca, amarela, amarela/preta, laranja/branca, laranja, laranja/preta, verde/branca, verde, verde/preta.

**Fase 9 — Dashboard admin**
Página `/admin` com cards de resumo (ativos/inativos/trancados, presenças do mês, frequência média, mensalidades atrasadas), seção "Alunos que sumiram" (sem presença há 30+ dias), gráfico de barras (recharts, toggle semanas/meses), situação financeira com 3 números coloridos, últimas 5 graduações.

**Fase 10 — Relatórios** ⚠️ PENDENTE
Não implementado. A implementar:
- Página `/admin/relatorios`, seleção de mês
- Geração Excel/CSV (Bloco 1)
- Geração PDF com logo (Bloco 2)

**Fase 11 — Avisos**
CRUD de avisos no admin (criar, editar, fixar, publicar/despublicar, apagar). Página `/avisos` para alunos com cards, badge "Fixado", data formatada. Badge de não lidos na navegação via localStorage timestamp.

**Fase 12 — Galeria de fotos**
CRUD de álbuns (`/admin/albuns`). Upload múltiplo para bucket `galeria` no Supabase Storage. Página `/galeria` com grid de álbuns e capas. Página `/galeria/[id]` com lightbox (prev/next). Seleção de capa por álbum.

**Fase 13 — Dependentes (Pai + Filhos)**
Nova tabela `dependentes` (responsavel_id → dependente_id). Filho tem perfil próprio no sistema mas sem login. Fluxo de presença: modal pré-QR "Registar para quem?" com lista do responsável + dependentes, gera 1 QR com array de IDs. RPC atualizado para registar presença para múltiplos alunos. Pai vê faixa, histórico e evolução dos filhos (read-only).

**Fase 14 — PWA**
Manifest com nome, ícones, cores Gracie Barra. Service worker via `next-pwa` com estratégia NetworkFirst (páginas/API) e CacheFirst (assets). Página `/offline`. Prompt de instalação (banner discreto, respeita localStorage para não repetir). Splash screens para iOS (apple-launch-image) para tamanhos comuns.

---

### 🔄 Em andamento / Próximas

**Fase 10 — Relatórios** *(pendente, implementar antes de avançar)*
- Bloco 1: Página `/admin/relatorios` + exportação Excel/CSV
- Bloco 2: Geração PDF com logo e formatação

**Fase 15 — UI/UX Polishing**
- Redesign completo já iniciado (perfil do aluno com accordion, hero alinhado à esquerda, grid de ações 2 colunas com "Registrar Presença" fullwidth)
- Revisão das restantes páginas
- Animações, micro-interações, acessibilidade

**Fase 16 — Notificações push**
- Web Push API + Supabase Edge Functions + cron jobs
- Avisos gerais, lembretes de mensalidade (3 dias antes, no dia, após vencimento), parabéns por graduação

**Fase 17 — Gamificação (bônus)**
- Ranking de presença mensal
- Streak de treinos consecutivos
- Badges ("10 treinos seguidos", "100 presenças total")

---

## Funcionalidades transversais (implementar junto às fases relevantes)

### Controle financeiro no QR e reservas (implementar na Fase 7)
- `registrar_presenca_por_token()` verifica `data_vencimento_mensalidade` antes de registrar
- Se vencida há mais de X dias: rejeita com mensagem `"Autenticação não permitida. Mais informações falar com Simone."` + link WhatsApp
- Reserva de aula também bloqueada se mensalidade vencida há mais de X dias
- Banner vermelho no app do aluno quando mensalidade vencida ou próxima do vencimento

### Modal de pagamento (implementar na Fase 6 ou 7)
- Botão "Pagar mensalidade" no app do aluno
- Modal exibe dados de MBWay e IBAN da academia
- Solução manual no curto prazo; futuramente considerar Stripe ou EuPago para confirmação automática
