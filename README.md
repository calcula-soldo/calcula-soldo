# Calcula Soldo — CBMERJ

Simulador de vencimentos do Corpo de Bombeiros Militar do Estado do Rio de Janeiro.
Calcula soldo, GRET, IHP, GRAM, triênios, descontos e salário líquido com base na
legislação vigente.

> **Ferramenta não oficial.** Sem vínculo com o CBMERJ. Valores são estimativas de referência.

## Funcionalidades

- **Calculadora** — simula o contracheque completo por posto/graduação
- **Comparar Postos** — compara dois postos lado a lado
- **Cenários de Reajuste** — tabela com múltiplos percentuais (0% a 30%)
- **Exportar PDF** — impressão via diálogo do browser
- **Copiar** — copia resumo para compartilhar via WhatsApp/Telegram

## Stack

- **Next.js 16.2** + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- Deploy: **Vercel**

## Setup

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Instalar componentes shadcn/ui

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add badge button checkbox input label select separator slider tabs tooltip
```

> Quando perguntado sobre o estilo, escolha **New York**. Para o tema, **Zinc**.
> Para CSS variables, **Yes**. Para o diretório de componentes, aceite o default.

### 3. Rodar em desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 4. Deploy na Vercel

```bash
npx vercel
```

Ou conecte o repositório GitHub na dashboard da Vercel.

## Estrutura

```
src/
├── app/
│   ├── globals.css       # design system + variáveis shadcn + print CSS
│   ├── layout.tsx        # root layout com fontes
│   └── page.tsx          # tabs principais
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── calculator/
│       ├── CalculatorView.tsx   # calculadora principal (estado completo)
│       ├── Contracheque.tsx     # holerite + exportação
│       ├── ComparePanel.tsx     # comparação de postos
│       └── ScenarioTable.tsx    # cenários de reajuste
├── lib/
│   ├── calc.ts           # motor de cálculo (puro, sem side effects)
│   ├── data.ts           # tabelas POSTOS, CURSOS, constantes legais
│   ├── export.ts         # print, copy, share
│   └── utils.ts          # cn(), fmt(), fmtDiff()
└── types/
    └── index.ts          # tipos TypeScript centralizados
```

## Legislação de referência

- Soldos e GRET: legislação vigente CBMERJ
- GRAM: 62,5% sobre (Soldo + GRET + IHP)
- Triênios: 10% no 1º + 5% por triênio adicional (máx. 11)
- Previdência: SPSMERJ 10,5%
- Fundo de saúde: 10% + 1% por dependente, sobre o soldo
- IRPF: tabela progressiva 2024/2025
- Vale transporte: R$ 100,00 fixo

## Roadmap

- [ ] Suporte à PMERJ (mesma estrutura de cálculo)
- [ ] Filtro por categoria (praças / oficiais)
- [ ] Exportação para Excel/CSV
- [ ] Compartilhamento via link com parâmetros na URL
- [ ] PWA (funcionar offline)
