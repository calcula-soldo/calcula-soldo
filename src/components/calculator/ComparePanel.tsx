'use client'

import { useState, useMemo } from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { POSTOS, CURSOS } from '@/lib/data'
import { computeAll } from '@/lib/calc'
import { fmt } from '@/lib/utils'
import type { SimulatorState, CalcResult } from '@/types'

// ── Mini formulário ──────────────────────────────────────────────
interface MiniFormProps {
  state: SimulatorState
  onChange: (updates: Partial<SimulatorState>) => void
  accent: 'blue' | 'purple'
  label: string
}

function MiniForm({ state, onChange, accent, label }: MiniFormProps) {
  const cursos = state.postoNome ? (CURSOS[state.postoNome] ?? []) : []
  const accentClasses = accent === 'blue'
    ? 'text-blue-400 border-blue-900/40 bg-blue-950/15'
    : 'text-purple-400 border-purple-900/40 bg-purple-950/15'

  return (
    <div className="card-section space-y-3">
      <div className={`text-xs font-bold tracking-widest uppercase px-2 py-1 rounded border inline-block ${accentClasses}`}>
        {label}
      </div>

      <div className="field">
        <Label>Posto / Graduação</Label>
        <Select
          value={state.postoNome}
          onValueChange={v => onChange({ postoNome: v, cursoIdx: 0, comEspec: false })}
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
        <Label>Curso / Habilitação</Label>
        <Select
          value={String(state.cursoIdx)}
          onValueChange={v => onChange({ cursoIdx: Number(v), comEspec: false })}
          disabled={!state.postoNome}
        >
          <SelectTrigger><SelectValue placeholder="Selecione o curso..." /></SelectTrigger>
          <SelectContent>
            {cursos.map((c, i) => (
              <SelectItem key={i} value={String(i)}>
                {c.c}{c.ihp > 0 ? ` (${(c.ihp * 100).toFixed(0)}%)` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <Label>Triênios</Label>
          <Input
            type="number" min={0} max={11}
            value={state.trienios || ''}
            placeholder="0"
            onChange={e => onChange({ trienios: Math.min(11, Math.max(0, parseInt(e.target.value) || 0)) })}
          />
        </div>
        <div className="field">
          <Label>Dependentes</Label>
          <Input
            type="number" min={0} max={20}
            value={state.dependentes || ''}
            placeholder="0"
            onChange={e => onChange({ dependentes: Math.max(0, parseInt(e.target.value) || 0) })}
          />
        </div>
      </div>
    </div>
  )
}

// ── Utilitário ───────────────────────────────────────────────────
function calcFromState(s: SimulatorState): CalcResult | null {
  const posto = POSTOS.find(p => p.nome === s.postoNome)
  if (!posto) return null
  const cursos = CURSOS[s.postoNome] ?? []
  const curso = cursos[s.cursoIdx] ?? { c: '', ihp: 0, espec: false }
  const ihpMult = s.comEspec && curso.espec ? 0.85 : curso.ihp
  return computeAll(posto.soldo, ihpMult, s.trienios, s.dependentes, posto.gret)
}

const INIT: SimulatorState = {
  postoNome: '', cursoIdx: 0, comEspec: false, trienios: 0, dependentes: 0, reajPct: 0,
}

// ── Linhas da tabela comparativa ─────────────────────────────────
type Row = { label: string; key: keyof CalcResult; isTotal?: boolean; isDiscount?: boolean }
const ROWS: Row[] = [
  { label: 'Soldo base',       key: 'soldo'      },
  { label: 'GRET',             key: 'gret'       },
  { label: 'IHP',              key: 'ihp'        },
  { label: 'GRAM',             key: 'gram'       },
  { label: 'Triênio',          key: 'trienioVal' },
  { label: 'Vale transporte',  key: 'valeTransp' },
  { label: 'Bruto total',      key: 'bruto',       isTotal: true },
  { label: 'Fundo de saúde',   key: 'fundoSaude',  isDiscount: true },
  { label: 'Previdência',      key: 'prev',         isDiscount: true },
  { label: 'IRPF',             key: 'ir',           isDiscount: true },
  { label: 'Total descontos',  key: 'totalDesc',    isDiscount: true, isTotal: true },
  { label: 'Líquido',          key: 'liquido',      isTotal: true },
]

// ── Componente principal ─────────────────────────────────────────
export function ComparePanel() {
  const [left, setLeft]   = useState<SimulatorState>(INIT)
  const [right, setRight] = useState<SimulatorState>(INIT)

  const lResult = useMemo(() => calcFromState(left),  [left])
  const rResult = useMemo(() => calcFromState(right), [right])

  const hasAny = lResult || rResult

  return (
    <div className="space-y-4">
      {/* Mini formulários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MiniForm
          state={left}
          onChange={u => setLeft(p => ({ ...p, ...u }))}
          accent="blue"
          label="Posto A"
        />
        <MiniForm
          state={right}
          onChange={u => setRight(p => ({ ...p, ...u }))}
          accent="purple"
          label="Posto B"
        />
      </div>

      {/* Tabela comparativa */}
      {hasAny && (
        <section className="card-section">
          <div className="section-label">Comparativo de Remuneração</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs">
                    Item
                  </th>
                  <th className="text-right py-2 px-4 text-blue-400 font-semibold text-xs">
                    Posto A
                  </th>
                  <th className="text-right py-2 px-4 text-purple-400 font-semibold text-xs">
                    Posto B
                  </th>
                  <th className="text-right py-2 pl-4 text-muted-foreground font-medium text-xs">
                    Diferença (B−A)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(({ label, key, isTotal, isDiscount }) => {
                  const lv = lResult ? (lResult[key] as number) : null
                  const rv = rResult ? (rResult[key] as number) : null
                  const diff = lv !== null && rv !== null ? rv - lv : null

                  const rowClass = isTotal
                    ? 'font-semibold border-b border-border/80 bg-muted/20'
                    : 'border-b border-border/40'
                  const lClass = isDiscount ? 'text-red-400' : isTotal ? 'text-foreground' : 'text-blue-300'
                  const rClass = isDiscount ? 'text-red-400' : isTotal ? 'text-foreground' : 'text-purple-300'

                  const diffColor =
                    diff === null ? 'text-muted-foreground' :
                    key === 'totalDesc' || isDiscount
                      ? diff > 0 ? 'text-red-400' : diff < 0 ? 'text-green-400' : 'text-muted-foreground'
                      : diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'

                  return (
                    <tr key={key} className={rowClass}>
                      <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                      <td className={`py-2 px-4 text-right font-mono ${lClass}`}>
                        {lv !== null ? fmt(lv) : '—'}
                      </td>
                      <td className={`py-2 px-4 text-right font-mono ${rClass}`}>
                        {rv !== null ? fmt(rv) : '—'}
                      </td>
                      <td className={`py-2 pl-4 text-right font-mono ${diffColor}`}>
                        {diff !== null
                          ? (diff >= 0 ? '+' : '') + fmt(diff)
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasAny && (
        <div className="card-section text-center py-12 text-muted-foreground text-sm">
          Selecione os postos acima para visualizar o comparativo.
        </div>
      )}
    </div>
  )
}
