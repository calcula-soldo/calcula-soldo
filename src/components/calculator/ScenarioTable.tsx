'use client'

import { useState, useMemo } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { POSTOS, CURSOS } from '@/lib/data'
import { computeScenarios } from '@/lib/calc'
import { fmt } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { SimulatorState } from '@/types'

/** Percentuais de reajuste exibidos na tabela */
const PERCENTUAIS = [0, 2, 3, 5, 7, 10, 12, 15, 20, 25, 30]

type FormState = Omit<SimulatorState, 'reajPct'>

const INIT: FormState = {
  postoNome: '',
  cursoIdx: 0,
  comEspec: false,
  trienios: 0,
  dependentes: 0,
}

export function ScenarioTable() {
  const [s, setS] = useState<FormState>(INIT)

  const posto = POSTOS.find(p => p.nome === s.postoNome) ?? null
  const cursos = s.postoNome ? (CURSOS[s.postoNome] ?? []) : []
  const curso = cursos[s.cursoIdx] ?? { c: '', ihp: 0, espec: false }
  const ihpMult = s.comEspec && curso.espec ? 0.85 : curso.ihp

  const scenarios = useMemo(() => {
    if (!posto) return []
    return computeScenarios(
      posto.soldo,
      ihpMult,
      s.trienios,
      s.dependentes,
      posto.gret,
      PERCENTUAIS,
    )
  }, [posto, ihpMult, s.trienios, s.dependentes])

  const base = scenarios[0] // pct === 0

  return (
    <div className="space-y-4">

      {/* Parâmetros */}
      <section className="card-section">
        <div className="section-label">Parâmetros</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          <div className="field sm:col-span-2">
            <Label>Posto / Graduação</Label>
            <Select
              value={s.postoNome}
              onValueChange={v => setS(p => ({ ...p, postoNome: v, cursoIdx: 0, comEspec: false }))}
            >
              <SelectTrigger><SelectValue placeholder="Selecione o posto..." /></SelectTrigger>
              <SelectContent>
                {POSTOS.map(p => (
                  <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="field">
            <Label>Triênios <span className="text-muted-foreground text-xs">(máx. 11)</span></Label>
            <Input
              type="number" min={0} max={11}
              value={s.trienios || ''}
              placeholder="0"
              onChange={e => setS(p => ({ ...p, trienios: Math.min(11, parseInt(e.target.value) || 0) }))}
            />
          </div>

          <div className="field">
            <Label>Dependentes</Label>
            <Input
              type="number" min={0} max={20}
              value={s.dependentes || ''}
              placeholder="0"
              onChange={e => setS(p => ({ ...p, dependentes: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </section>

      {/* Tabela de cenários */}
      {scenarios.length > 0 && posto ? (
        <section className="card-section">
          <div className="section-label">
            Cenários de Reajuste — {s.postoNome}
            {curso.ihp > 0 && (
              <span className="ml-2 normal-case text-blue-400 font-mono">
                · IHP {(ihpMult * 100).toFixed(0)}%
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    ['Reajuste',   'text-left pl-2'],
                    ['Soldo',      'text-right px-3'],
                    ['Bruto',      'text-right px-3'],
                    ['Δ Bruto',    'text-right px-3'],
                    ['Líquido',    'text-right px-3'],
                    ['Δ Líquido',  'text-right px-3 pr-2'],
                  ].map(([h, cls]) => (
                    <th key={h} className={`py-2.5 text-muted-foreground font-medium text-xs ${cls}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map(({ pct, soldo, bruto, liquido, deltaBruto, deltaLiquido }) => {
                  const isBase = pct === 0
                  const fmtDeltaPos = (v: number) =>
                    isBase ? '—' : `+${fmt(v)}`

                  return (
                    <tr
                      key={pct}
                      className={cn(
                        'border-b border-border/40 transition-colors',
                        isBase
                          ? 'bg-muted/25 text-muted-foreground'
                          : 'hover:bg-muted/15',
                      )}
                    >
                      {/* Reajuste */}
                      <td className="py-2.5 pl-2">
                        <span
                          className={cn(
                            'font-mono font-semibold text-xs px-2 py-0.5 rounded',
                            isBase
                              ? 'text-muted-foreground bg-muted/50'
                              : 'text-green-400 bg-green-950/40 border border-green-900/40',
                          )}
                        >
                          {isBase ? 'Atual' : `+${pct}%`}
                        </span>
                      </td>

                      {/* Soldo */}
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        {fmt(soldo)}
                      </td>

                      {/* Bruto */}
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        {fmt(bruto)}
                      </td>

                      {/* Δ Bruto */}
                      <td className={cn(
                        'py-2.5 px-3 text-right font-mono text-xs',
                        isBase ? 'text-muted-foreground' : 'text-green-400',
                      )}>
                        {fmtDeltaPos(deltaBruto)}
                      </td>

                      {/* Líquido */}
                      <td className={cn(
                        'py-2.5 px-3 text-right font-mono font-semibold',
                        isBase ? 'text-foreground' : 'text-green-300',
                      )}>
                        {fmt(liquido)}
                      </td>

                      {/* Δ Líquido */}
                      <td className={cn(
                        'py-2.5 px-3 pr-2 text-right font-mono text-xs',
                        isBase ? 'text-muted-foreground' : 'text-green-400',
                      )}>
                        {fmtDeltaPos(deltaLiquido)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              {/* Rodapé com total do impacto máximo */}
              {base && scenarios.length > 1 && (
                <tfoot>
                  <tr className="border-t border-border/80">
                    <td colSpan={4} className="py-2 pl-2 text-xs text-muted-foreground">
                      Impacto máximo (+30%):
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs text-green-400 font-semibold">
                      {fmt(scenarios[scenarios.length - 1].liquido)}
                    </td>
                    <td className="py-2 px-3 pr-2 text-right font-mono text-xs text-green-400">
                      +{fmt(scenarios[scenarios.length - 1].deltaLiquido)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground font-mono mt-3">
            * Δ = variação em relação ao vencimento atual (sem reajuste)
          </p>
        </section>
      ) : (
        <div className="card-section text-center py-12 text-muted-foreground text-sm">
          Selecione um posto acima para gerar os cenários.
        </div>
      )}
    </div>
  )
}
