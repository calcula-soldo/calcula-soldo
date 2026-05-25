# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Repositório: https://github.com/calcula-soldo/calcula-soldo  
Deploy: https://calcula-soldo.vercel.app  
Simulador de vencimentos militares CBMERJ. Next.js 16.2 + TypeScript + Tailwind CSS + shadcn/ui.

---

## Comandos de desenvolvimento

```bash
npm run dev          # desenvolvimento com Turbopack
npm run build        # build de produção
npm run type-check   # valida TypeScript sem compilar (única verificação estática)
npm run lint         # ESLint
```

Não há test runner configurado (jest/vitest). Verificação de correção = `type-check` + `lint`.

---

## Setup inicial (após clonar)

**Package manager: pnpm 11** (único lockfile: `pnpm-lock.yaml`). Não usar npm/yarn.

```bash
pnpm install
pnpm dev
```

Config do pnpm em `pnpm-workspace.yaml` (pnpm 11 não lê mais o campo `pnpm` do `package.json` nem configs de comportamento do `.npmrc`).

Os componentes shadcn/ui (`src/components/ui/`) já estão commitados. Só execute `pnpm dlx shadcn@latest add <componente>` para adicionar novos componentes.

---

## Stack e convenções

- **Bundler**: Turbopack (default Next.js 16 — não usar `--turbo` explícito)
- **TypeScript**: strict mode. Sem `any` explícito.
- **Tailwind**: v3. **Nunca** usar v4. CSS variables para design tokens.
- **shadcn/ui**: new-york style, zinc base (`components.json` commitado).
- **Dark mode**: `class="dark"` fixo no `<html>` — não há toggle.
- **Fontes**: `var(--font-syne)` para UI, `var(--font-jetbrains)` para valores monetários.
- **Imports**: sempre `@/` (ex: `@/lib/calc`, `@/types`). Nunca caminhos relativos para `src/`.
- **Client components**: apenas quando usam hooks/browser APIs → adicionar `'use client'` no topo.
- **Server components**: `page.tsx` e layouts são server por padrão.

---

## Arquitetura

`page.tsx` renderiza três tabs (Calculadora | Comparar Postos | Cenários), cada uma com um componente independente. Todo o estado de UI vive dentro dos componentes client — não há estado global nem contexto compartilhado.

O fluxo de dados é unidirecional: `data.ts` → `calc.ts` (funções puras) → componentes.

```
src/
├── app/
│   ├── globals.css        ← CSS vars shadcn + classes utilitárias + print CSS
│   ├── layout.tsx         ← Fontes, metadata SEO, dark class no html
│   └── page.tsx           ← Tabs: Calculadora | Comparar Postos | Cenários
├── components/
│   ├── layout/            ← Header.tsx, Footer.tsx
│   └── calculator/
│       ├── CalculatorView.tsx   ← estado centralizado da calculadora (SimulatorState)
│       ├── Contracheque.tsx     ← holerite + botões print/copy
│       ├── ComparePanel.tsx     ← dois formulários + tabela comparativa
│       └── ScenarioTable.tsx    ← tabela de cenários de reajuste
├── lib/
│   ├── calc.ts            ← motor de cálculo puro, sem side effects
│   ├── data.ts            ← POSTOS[], CURSOS{}, FAIXAS_IR[], CONSTS
│   ├── export.ts          ← printContracheque(), copyToClipboard(), buildShareText()
│   └── utils.ts           ← cn(), fmt(), fmtDiff(), fmtPct()
└── types/
    └── index.ts           ← Corporacao, Posto, Curso, CalcResult, SimulatorState, ScenarioRow
```

---

## Fórmulas de cálculo (`src/lib/calc.ts`)

**Parte mais crítica — nunca alterar sem confirmar a legislação vigente.**

```
GRET        = soldo × posto.gret           (multiplicador, ex: 1.5)
IHP         = soldo × ihpMult              (decimal, ex: 0.75)
GRAM        = (soldo + GRET + IHP) × 0.625
baseTriênio = soldo + GRET + IHP + GRAM
pctTriênio  = 10% no 1º + 5% por triênio adicional (máx. 11 triênios)
triênio     = baseTriênio × pctTriênio
basePrev    = soldo + GRET + IHP + GRAM + triênio
bruto       = basePrev + R$ 100,00 (vale transporte fixo)
prev        = basePrev × 10,5%   [SPSMERJ]
fundoSaúde  = soldo × (10% + dependentes × 1%)
baseIR      = basePrev − prev − fundoSaúde − dependentes × R$ 235,88
IR          = tabela progressiva FAIXAS_IR (2024/2025)
líquido     = bruto − fundoSaúde − prev − IR
```

**IHP com especialização**: quando `curso.espec === true` e o militar marcou especialização, `ihpMult = CONSTS.IHP_ESPEC (0.85)`, independente do `curso.ihp` padrão.

---

## Dados editáveis (`src/lib/data.ts`)

- `POSTOS[]` — 15 postos/graduações com `soldo`, `gret` (multiplicador GRET) e `categoria` ('pracas' | 'oficiais')
- `CURSOS{}` — mapeado por `posto.nome`, array de `Curso` com `ihp` e `espec`
- `FAIXAS_IR[]` — tabela IRPF 2024/2025
- `CONSTS` — `GRAM_PCT`, `VALE_TRANSP`, `PREV_PCT`, `DEDUCAO_DEP_IR`, `IHP_ESPEC`, `TRIENIO_BASE`, `TRIENIO_INC`, `TRIENIO_MAX`

> Para suporte à PMERJ: adicionar `corporacao: 'PMERJ'` nos dados em `data.ts`. O tipo `Corporacao` e o motor de cálculo já são corporação-agnósticos.

---

## Exportação e print

- Botão **"PDF"** usa `window.print()` — não introduzir bibliotecas de PDF.
- `@media print` em `globals.css` oculta tudo exceto `#contracheque-section`.
- Botão **"Copiar"** usa `navigator.clipboard.writeText()` via `copyToClipboard()` em `export.ts`.

---

## Design system

| Token                  | Valor                          |
|------------------------|--------------------------------|
| Background principal   | `hsl(220, 42%, 5%)`            |
| Background card        | `hsl(220, 38%, 7%)`            |
| Acento primário        | `hsl(0, 62%, 46%)` (vermelho)  |
| Fonte UI               | Syne (`var(--font-syne)`)      |
| Fonte valores          | JetBrains Mono (`var(--font-jetbrains)`) |

Classes CSS customizadas em `globals.css`: `.card-section`, `.section-label`, `.field`, `.hint`, `.metric-card`, `.espec-row`, `.contracheque`, `.cb-row`, `.lgpd-warning`.

---

## Regras de negócio obrigatórias

- **Aviso LGPD**: o bloco `.lgpd-warning` **nunca** pode ser removido do `CalculatorView`.
- **Aviso não oficial**: `Footer.tsx` deve sempre deixar claro que o site **não tem vínculo** com o CBMERJ.
- **Soldos**: hardcoding **proibido** fora de `src/lib/data.ts`.
- **Estado global**: proibido adicionar Redux/Zustand — o projeto é client-only, sem servidor.

---

## Roadmap (backlog priorizado)

### Alta prioridade
- [ ] Suporte PMERJ (mesmos cálculos, dados de soldo diferentes)
- [ ] Filtro por categoria: Oficiais / Praças (campo `categoria` já existe em `Posto`)
- [ ] Exportação CSV/Excel do resultado

### Média prioridade
- [ ] Compartilhamento via URL com parâmetros (`?posto=MAJ&curso=...`)
- [ ] Modo de simulação de progressão de carreira (N triênios ao longo do tempo)
- [ ] Dark/light mode toggle

### Baixa prioridade
- [ ] PWA / installable

---

## Convenções de commit

```
feat: adiciona suporte PMERJ
fix: corrige cálculo de triênio no 11º nível
refactor: extrai MiniForm para componente próprio
docs: atualiza README com novas funcionalidades
chore: atualiza dependências
```
