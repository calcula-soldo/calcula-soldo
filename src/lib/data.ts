import type { Posto, Curso } from '@/types'

/**
 * Postos e Graduações do CBMERJ com soldo base e multiplicador GRET.
 * Fonte: legislação vigente CBMERJ.
 */
export const POSTOS: Posto[] = [
  { nome: 'SD AL.',    soldo:  817.67, gret: 1.225, categoria: 'pracas'   },
  { nome: 'SD',        soldo:  991.03, gret: 1.5,   categoria: 'pracas'   },
  { nome: 'CB',        soldo: 1141.48, gret: 1.5,   categoria: 'pracas'   },
  { nome: '3º SGT',    soldo: 1318.10, gret: 1.5,   categoria: 'pracas'   },
  { nome: '2º SGT',    soldo: 1448.92, gret: 1.5,   categoria: 'pracas'   },
  { nome: '1º SGT',    soldo: 1596.10, gret: 1.5,   categoria: 'pracas'   },
  { nome: 'SUBTEN',    soldo: 1736.74, gret: 1.5,   categoria: 'pracas'   },
  { nome: 'CAD',       soldo: 1141.48, gret: 1.225, categoria: 'oficiais' },
  { nome: 'ASP OF',    soldo: 1736.74, gret: 1.5,   categoria: 'oficiais' },
  { nome: '2º TEN',    soldo: 1929.73, gret: 1.5,   categoria: 'oficiais' },
  { nome: '1º TEN',    soldo: 2145.59, gret: 1.5,   categoria: 'oficiais' },
  { nome: 'CAP',       soldo: 2384.35, gret: 1.5,   categoria: 'oficiais' },
  { nome: 'MAJ',       soldo: 2649.27, gret: 1.925, categoria: 'oficiais' },
  { nome: 'TEN CEL',   soldo: 2943.64, gret: 1.925, categoria: 'oficiais' },
  { nome: 'CEL',       soldo: 3270.72, gret: 1.925, categoria: 'oficiais' },
]

/**
 * Cursos e habilitações por posto, com percentual do IHP.
 * espec: true indica que o posto pode ter curso de especialização (+5% IHP, 75%→85%).
 */
export const CURSOS: Record<string, Curso[]> = {
  'SD AL.':   [{ c: 'NÃO POSSUI',    ihp: 0,    espec: false }],
  'SD':       [{ c: 'CFSD',          ihp: 0.75, espec: false }],
  'CB':       [
    { c: 'CFSD',          ihp: 0.75, espec: false },
    { c: 'CFC/CEFC',      ihp: 0.75, espec: false },
  ],
  '3º SGT':   [
    { c: 'CFC/CEFC',      ihp: 0.75, espec: false },
    { c: 'CFS/CEFS',      ihp: 0.80, espec: true  },
  ],
  '2º SGT':   [
    { c: 'CFS/CEFS',      ihp: 0.80, espec: true  },
    { c: 'CAS',           ihp: 1.10, espec: false },
  ],
  '1º SGT':   [{ c: 'CAS',           ihp: 1.10, espec: false }],
  'SUBTEN':   [{ c: 'CAS',           ihp: 1.10, espec: false }],
  'CAD':      [{ c: 'NÃO POSSUI',    ihp: 0,    espec: false }],
  'ASP OF':   [{ c: 'CFO',           ihp: 0.80, espec: false }],
  '2º TEN':   [
    { c: 'CFO',           ihp: 0.80, espec: true  },
    { c: 'CAS',           ihp: 1.10, espec: false },
  ],
  '1º TEN':   [
    { c: 'CFO',           ihp: 0.80, espec: true  },
    { c: 'CAS',           ihp: 1.10, espec: false },
  ],
  'CAP':      [
    { c: 'CFO',           ihp: 0.80, espec: true  },
    { c: 'CAO/CAS/CCOS',  ihp: 1.10, espec: false },
  ],
  'MAJ':      [
    { c: 'CAO/CCOS',      ihp: 1.10, espec: false },
    { c: 'CSBM',          ihp: 1.60, espec: false },
  ],
  'TEN CEL':  [
    { c: 'CAO/CCOS',      ihp: 1.10, espec: false },
    { c: 'CSBM',          ihp: 1.60, espec: false },
  ],
  'CEL':      [{ c: 'CSBM',          ihp: 1.60, espec: false }],
}

/** Percentuais e constantes legais */
export const CONSTS = {
  GRAM_PCT: 0.625,       // 62,5% da base (soldo + GRET + IHP)
  VALE_TRANSP: 100,      // valor fixo R$ 100,00
  PREV_PCT: 0.105,       // 10,5% SPSMERJ
  DEDUCAO_DEP_IR: 235.88, // dedução por dependente na base do IRPF
  IHP_ESPEC: 0.85,       // IHP com especialização
  TRIENIO_BASE: 0.10,    // 10% no 1º triênio
  TRIENIO_INC: 0.05,     // +5% por triênio adicional
  TRIENIO_MAX: 11,
}

/** Tabela IRPF 2024/2025 */
export const FAIXAS_IR = [
  { limite: 2259.20, aliq: 0,      deducao: 0      },
  { limite: 2826.65, aliq: 0.075,  deducao: 169.44 },
  { limite: 3751.05, aliq: 0.15,   deducao: 381.44 },
  { limite: 4664.68, aliq: 0.225,  deducao: 662.77 },
  { limite: Infinity, aliq: 0.275, deducao: 896.00 },
]
