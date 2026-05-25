import type { CalcResult, ScenarioRow } from '@/types'
import { CONSTS, FAIXAS_IR } from './data'

const { GRAM_PCT, VALE_TRANSP, PREV_PCT, DEDUCAO_DEP_IR, TRIENIO_BASE, TRIENIO_INC } = CONSTS

/** Calcula o IRPF sobre a base tributável */
export function calcIR(base: number): number {
  const faixa = FAIXAS_IR.find(f => base <= f.limite)!
  return Math.max(0, base * faixa.aliq - faixa.deducao)
}

/** Calcula o percentual do triênio para N triênios */
export function calcPctTrienio(trienios: number): number {
  if (trienios <= 0) return 0
  return TRIENIO_BASE + (trienios - 1) * TRIENIO_INC
}

/**
 * Calcula a remuneração completa dado o soldo e parâmetros.
 *
 * @param soldoBase  - Soldo base (já com reajuste, se houver)
 * @param ihpMult    - Multiplicador do IHP como decimal (ex: 0.75)
 * @param trienios   - Número de triênios (0–11)
 * @param dependentes - Número de dependentes
 * @param gretMult   - Multiplicador da GRET (ex: 1.5)
 */
export function computeAll(
  soldoBase: number,
  ihpMult: number,
  trienios: number,
  dependentes: number,
  gretMult: number,
): CalcResult {
  const soldo      = soldoBase
  const gret       = soldo * gretMult
  const ihp        = soldo * ihpMult
  const gram       = (soldo + gret + ihp) * GRAM_PCT

  const baseTrienio  = soldo + gret + ihp + gram
  const pctTrienio   = calcPctTrienio(trienios)
  const trienioVal   = baseTrienio * pctTrienio

  const basePrev  = soldo + gret + ihp + gram + trienioVal
  const bruto     = basePrev + VALE_TRANSP

  // Descontos
  const prev       = basePrev * PREV_PCT
  const pctFundo   = 0.10 + dependentes * 0.01
  const fundoSaude = soldo * pctFundo
  const baseIR     = basePrev - prev - fundoSaude - dependentes * DEDUCAO_DEP_IR
  const ir         = calcIR(baseIR)

  const totalDesc = fundoSaude + prev + ir
  const liquido   = bruto - totalDesc

  return {
    soldo, gret, ihp, gram,
    trienioVal, pctTrienio,
    basePrev, bruto,
    prev, pctFundo, fundoSaude,
    baseIR, ir,
    totalDesc, liquido,
    valeTransp: VALE_TRANSP,
  }
}

/** Calcula com reajuste percentual aplicado ao soldo */
export function computeWithReaj(
  soldoBase: number,
  reajPct: number,
  ihpMult: number,
  trienios: number,
  dependentes: number,
  gretMult: number,
): CalcResult {
  const soldoReaj = soldoBase * (1 + reajPct / 100)
  return computeAll(soldoReaj, ihpMult, trienios, dependentes, gretMult)
}

/** Gera tabela de cenários de reajuste para um posto */
export function computeScenarios(
  soldoBase: number,
  ihpMult: number,
  trienios: number,
  dependentes: number,
  gretMult: number,
  percentuais: number[],
): ScenarioRow[] {
  const base = computeAll(soldoBase, ihpMult, trienios, dependentes, gretMult)

  return percentuais.map(pct => {
    const r = pct === 0
      ? base
      : computeWithReaj(soldoBase, pct, ihpMult, trienios, dependentes, gretMult)

    return {
      pct,
      soldo: r.soldo,
      bruto: r.bruto,
      liquido: r.liquido,
      deltaBruto: r.bruto - base.bruto,
      deltaLiquido: r.liquido - base.liquido,
    }
  })
}
