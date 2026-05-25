# calcula-soldo — Guia para Claude Code

Repositório: https://github.com/calcula-soldo/calcula-soldo  
Deploy: https://calcula-soldo.vercel.app  
Simulador de vencimentos militares CBMERJ. Next.js 16.2 + TypeScript + Tailwind CSS + shadcn/ui.

---

## Contexto do projeto

Este scaffold foi gerado com todas as camadas de lógica, tipagem e componentes funcionais.  
**Antes de qualquer alteração, leia este arquivo integralmente.**

---

## Setup inicial (após clonar)

```bash
npm install
npx shadcn@latest init
# Quando perguntado: style=new-york, base color=zinc, CSS variables=yes
npx shadcn@latest add badge button checkbox input label select separator slider tabs tooltip
npm run dev
```

---

## Stack e convenções

- **Bundler**: Turbopack (default Next.js 16 — não usar `--turbo` explícito)
- **TypeScript**: strict mode. Sem `any` explícito.
- **Tailwind**: v3. **Nunca** usar v4. CSS variables para design tokens.
- **shadcn/ui**: new-york style, zinc base, dark mode via `class="dark"` no `<html>`.
- **Fontes**: `var(--font-syne)` para UI, `var(--font-jetbrains)` para valores monetários.
- **Imports**: sempre `@/` (ex: `@/lib/calc`, `@/types`). Nunca caminhos relativos para `src/`.
- **Client components**: apenas quando usam hooks/browser APIs → adicionar `'use client'` no topo.
- **Server components**: `page.tsx` e layouts são server por padrão.

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── globals.css        ← CSS vars shadcn + classes utilitárias + print CSS
│   ├── layout.tsx         ← Fontes, metadata SEO, dark class no html
│   └── page.tsx           ← Tabs: Calculadora | Comparar Postos | Cenários
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── calculator/
│       ├── CalculatorView.tsx   ← estado centralizado do simulador
│       ├── Contracheque.tsx     ← holerite + botões print/copy
│       ├── ComparePanel.tsx     ← dois MiniForm + tabela comparativa
│       └── ScenarioTable.tsx    ← parâmetros + tabela de cenários
├── lib/
│   ├── calc.ts            ← motor de cálculo (nunca alterar sem confirmar legislação)
│   ├── data.ts            ← POSTOS[], CURSOS{}, FAIXAS_IR[], CONSTS
│   ├── export.ts          ← printContracheque(), copyToClipboard(), buildShareText()
│   └── utils.ts           ← cn(), fmt(), fmtDiff(), fmtPct()
└── types/
    └── index.ts           ← Corporacao, Posto, Curso, CalcResult, SimulatorState, ScenarioRow
```

---

## Fórmulas de cálculo (src/lib/calc.ts)

**Estas fórmulas são a parte mais crítica. Nunca alterar sem confirmar a legislação vigente.**

```
GRET        = soldo × gretMult
IHP         = soldo × ihpMult
GRAM        = (soldo + GRET + IHP) × 0.625
baseTriênio = soldo + GRET + IHP + GRAM
pctTriênio  = 10% (1º triênio) + 5% por triênio adicional (máx. 11 triênios)
triênio     = baseTriênio × pctTriênio
basePrev    = soldo + GRET + IHP + GRAM + triênio
bruto       = basePrev + R$ 100,00 (vale transporte fixo)
prev        = basePrev × 10,5%   [SPSMERJ]
fundoSaúde  = soldo × (10% + dependentes × 1%)
baseIR      = basePrev − prev − fundoSaúde − dependentes × R$ 235,88
IR          = tabela progressiva 2024/2025 (FAIXAS_IR em data.ts)
líquido     = bruto − fundoSaúde − prev − IR
```

**IHP com especialização**: quando `curso.espec === true` e o militar possui especialização,
`ihpMult = 0.85` (85%), independente do ihp padrão do curso.

---

## Dados editáveis (src/lib/data.ts)

- `POSTOS[]` — 15 postos/graduações com `soldo` e `gretMult`
- `CURSOS{}` — mapeado por nome do posto, array de cursos com `ihp` e `espec`
- `FAIXAS_IR[]` — tabela IRPF 2024/2025
- `CONSTS` — constantes legais (GRAM_PCT, PREV_PCT, TRIÊNIO_BASE_PCT, etc.)

> Para suporte à PMERJ no futuro: adicionar `corporacao: 'PMERJ'` nos dados em `data.ts`.  
> O motor de cálculo em `calc.ts` já é corporação-agnóstico.

---

## Exportação e print

- Botão **"PDF"** usa `window.print()` — não introduzir bibliotecas de PDF sem necessidade explícita.
- O `@media print` em `globals.css` oculta tudo exceto `#contracheque-section`.
- Botão **"Copiar"** usa `navigator.clipboard.writeText()` via `copyToClipboard()` em `export.ts`.

---

## Design system

| Token                  | Valor                        |
|------------------------|------------------------------|
| Background principal   | `hsl(220, 42%, 5%)`          |
| Background card        | `hsl(220, 38%, 7%)`          |
| Acento primário        | `hsl(0, 62%, 46%)` (vermelho)|
| Fonte UI               | Syne (`var(--font-syne)`)    |
| Fonte valores          | JetBrains Mono (`var(--font-jetbrains)`) |

Classes CSS customizadas definidas em `globals.css`:

| Classe           | Uso                                  |
|------------------|--------------------------------------|
| `.card-section`  | Container de seção com fundo card    |
| `.section-label` | Label uppercase de seção             |
| `.field`         | Wrapper de campo de formulário       |
| `.hint`          | Texto auxiliar abaixo de inputs      |
| `.metric-card`   | Card de métrica rápida               |
| `.espec-row`     | Toggle de especialização             |
| `.contracheque`  | Container principal do holerite      |
| `.cb-row`        | Linha de item do holerite            |
| `.lgpd-warning`  | Bloco de aviso LGPD                  |

---

## Regras de negócio obrigatórias

- **Aviso LGPD**: o bloco `.lgpd-warning` **nunca** pode ser removido do `CalculatorView`.
- **Aviso não oficial**: o `Footer.tsx` deve sempre deixar claro que o site **não tem vínculo** com o CBMERJ.
- **Soldos**: hardcoding **proibido** fora de `src/lib/data.ts`.
- **Estado global**: proibido adicionar Redux/Zustand — o projeto é client-only sem servidor.
- **`.env.local`**: nunca commitar com dados reais.

---

## Roadmap (backlog priorizado)

### Alta prioridade
- [ ] Suporte PMERJ (mesmos cálculos, dados de soldo diferentes)
- [ ] Filtro por categoria: Oficiais / Praças
- [ ] Exportação CSV/Excel do resultado

### Média prioridade
- [ ] Compartilhamento via URL com parâmetros (`?posto=MAJ&curso=...`)
- [ ] Modo de simulação de progressão de carreira (N triênios ao longo do tempo)
- [ ] Dark/light mode toggle

### Baixa prioridade
- [ ] Internacionalização (pt-BR apenas, mas estruturar para expansão)
- [ ] PWA / installable

---

## Comandos úteis

```bash
npm run dev          # desenvolvimento com Turbopack
npm run build        # build de produção
npm run type-check   # valida TypeScript sem compilar
npm run lint         # ESLint
```

---

## Convenções de commit

```
feat: adiciona suporte PMERJ
fix: corrige cálculo de triênio no 11º nível
refactor: extrai MiniForm para componente próprio
docs: atualiza README com novas funcionalidades
chore: atualiza dependências
```

