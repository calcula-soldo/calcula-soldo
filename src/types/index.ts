export type Corporacao = 'CBMERJ' | 'PMERJ'

export interface Posto {
  nome: string
  soldo: number
  /** multiplicador do soldo para calcular GRET */
  gret: number
  categoria: 'pracas' | 'oficiais'
}

export interface Curso {
  /** nome/sigla do curso */
  c: string
  /** percentual do IHP como decimal (ex: 0.75 = 75%) */
  ihp: number
  /** se true, exibe opção de especialização (+5% IHP) */
  espec: boolean
}

export interface CalcResult {
  soldo: number
  gret: number
  ihp: number
  gram: number
  trienioVal: number
  pctTrienio: number
  basePrev: number
  bruto: number
  prev: number
  pctFundo: number
  fundoSaude: number
  baseIR: number
  ir: number
  totalDesc: number
  liquido: number
  valeTransp: number
}

export interface SimulatorState {
  postoNome: string
  cursoIdx: number
  comEspec: boolean
  trienios: number
  dependentes: number
  reajPct: number
}

export type ScenarioRow = {
  pct: number
  soldo: number
  bruto: number
  liquido: number
  deltaBruto: number
  deltaLiquido: number
}
