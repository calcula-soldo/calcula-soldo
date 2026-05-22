'use client'

import { useState, useMemo, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { POSTOS, CURSOS } from '@/lib/data'
import { computeAll } from '@/lib/calc'
import { fmt, fmtDiff } from '@/lib/utils'
import { Contracheque } from './Contracheque'
import type { SimulatorState, CalcResult } from '@/types'

const INIT: SimulatorState = {
  postoNome: '',
  cursoIdx: 0,
  comEspec: false,
  trienios: 0,
  dependentes: 0,
  reajPct: 0,
}

export function CalculatorView() {
  const [s, setS] = useState<SimulatorState>(INIT)

  const set = useCallback(
    <K extends keyof SimulatorState>(key: K, value: SimulatorState[K]) =>
      setS(prev => ({ ...prev, [key]: value })),
    [],
  )

  // ── Dados derivados ──────────────────────────────────────────────
  const posto = useMemo(
    () => POSTOS.find(p => p.nome === s.postoNome) ?? null,
    [s.postoNome],
  )
  const cursos = useMemo(
    () => (s.postoNome ? (CURSOS[s.postoNome] ?? []) : []),
    [s.postoNome],
  )
  const curso = cursos[s.cursoIdx] ?? { c: '', ihp: 0, espec: false }
  const ihpMult = s.comEspec && curso.espec ? 0.85 : curso.ihp

  const base = useMemo<CalcResult | null>(() => {
    if (!posto) return null
    return computeAll(posto.soldo, ihpMult, s.trienios, s.dependentes, posto.gret)
  }, [posto, ihpMult, s.trienios, s.dependentes])

  const withReaj = useMemo<CalcResult | null>(() => {
    if (!posto || s.reajPct === 0) return base
    return computeAll(
      posto.soldo * (1 + s.reajPct / 100),
      ihpMult, s.trienios, s.dependentes, posto.gret,
    )
  }, [posto, ihpMult, s.trienios, s.dependentes, s.reajPct, base])

  const active = withReaj ?? base
  const hasReaj = s.reajPct > 0
  const hasResult = !!active && !!posto

  const pctTrienioStr = s.trienios > 0
    ? `${((0.10 + (s.trienios - 1) * 0.05) * 100).toFixed(0)}%`
    : '—'

  const ihpLabel = s.comEspec
    ? 'IHP (85% — Especialização)'
    : curso.ihp > 0
    ? `IHP (${(curso.ihp * 100).toFixed(0)}%)`
    : ''

  // ── Handlers ────────────────────────────────────────────────────
  function handlePostoChange(nome: string) {
    setS(prev => ({ ...prev, postoNome: nome, cursoIdx: 0, comEspec: false }))
  }

  function handleCursoChange(idx: string) {
    setS(prev => ({ ...prev, cursoIdx: Number(idx), comEspec: false }))
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── IDENTIFICAÇÃO ──────────────────────────────── */}
      <section className="card-section">
        <div className="section-label">Identificação</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="field">
            <Label>Posto / Graduação</Label>
            <Select value={s.postoNome} onValueChange={handlePostoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o posto..." />
              </SelectTrigger>
              <SelectContent>
                {POSTOS.map(p => (
                  <SelectItem key={p.nome} value={p.nome}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="field">
            <Label>Curso / Habilitação (IHP)</Label>
            <Select
              value={String(s.cursoIdx)}
              onValueChange={handleCursoChange}
              disabled={!s.postoNome}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o curso..." />
              </SelectTrigger>
              <SelectContent>
                {cursos.map((c, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {c.c}
                    {c.ihp > 0 ? ` (IHP ${(c.ihp * 100).toFixed(0)}%)` : ' (sem IHP)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Especialização (condicional) */}
        {curso.espec && (
          <div
            className="espec-row mt-3"
            onClick={() => set('comEspec', !s.comEspec)}
          >
            <Checkbox
              id="espec"
              checked={s.comEspec}
              onCheckedChange={v => set('comEspec', !!v)}
              onClick={e => e.stopPropagation()}
            />
            <label htmlFor="espec" className="text-sm text-muted-foreground flex-1 cursor-pointer">
              Possui <strong className="text-foreground">curso de especialização</strong>{' '}
              — IHP passa de{' '}
              <strong className="text-foreground">{(curso.ihp * 100).toFixed(0)}%</strong>
              {' '}para <strong className="text-foreground">85%</strong>
            </label>
            <span className="espec-badge">IHP +5%</span>
          </div>
        )}
      </section>

      {/* ── DADOS DO MILITAR ───────────────────────────── */}
      <section className="card-section">
        <div className="section-label">Dados do Militar</div>
        <div className="grid grid-cols-3 gap-4">

          <div className="field">
            <Label>
              Triênios{' '}
              <span className="text-muted-foreground text-xs font-normal">(máx. 11)</span>
            </Label>
            <Input
              type="number"
              min={0}
              max={11}
              value={s.trienios || ''}
              placeholder="0"
              onChange={e =>
                set('trienios', Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))
              }
            />
            {s.trienios > 0 && base && (
              <p className="hint">
                Base: {fmt(base.soldo + base.gret + base.ihp + base.gram)} ·{' '}
                <span className={s.trienios === 11 ? 'text-yellow-400' : 'text-blue-400'}>
                  {pctTrienioStr}
                  {s.trienios === 11 ? ' (máx)' : ''}
                </span>
              </p>
            )}
          </div>

          <div className="field">
            <Label>Dependentes</Label>
            <Input
              type="number"
              min={0}
              max={20}
              value={s.dependentes || ''}
              placeholder="0"
              onChange={e =>
                set('dependentes', Math.max(0, parseInt(e.target.value) || 0))
              }
            />
            <p className="hint">
              Fundo saúde:{' '}
              <span className="text-blue-400">
                {((0.10 + s.dependentes * 0.01) * 100).toFixed(0)}% do soldo
              </span>
            </p>
          </div>

          <div className="field">
            <Label>Vale transporte</Label>
            <Input
              type="number"
              value={100}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
            <p className="hint">Valor fixo</p>
          </div>
        </div>
      </section>

      {/* ── SIMULADOR DE REAJUSTE ──────────────────────── */}
      <section className="card-section">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm text-foreground">
            Simulador de Reajuste Salarial
          </span>
          <Badge
            variant={hasReaj ? 'default' : 'secondary'}
            className={hasReaj ? 'bg-green-950/60 text-green-400 border-green-900/40' : ''}
          >
            {hasReaj ? `+${s.reajPct.toFixed(2)}% aplicado` : 'Sem reajuste'}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={50}
            step={0.01}
            value={[s.reajPct]}
            onValueChange={([v]) => set('reajPct', v ?? 0)}
            className="flex-1"
          />
          <div className="relative w-24 flex-shrink-0">
            <Input
              type="number"
              min={0}
              max={50}
              step={0.01}
              value={s.reajPct || ''}
              placeholder="0.00"
              className={`text-right pr-7 font-mono text-sm ${hasReaj ? 'text-green-400' : ''}`}
              onChange={e => {
                const v = Math.min(50, Math.max(0, parseFloat(e.target.value) || 0))
                set('reajPct', v)
              }}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
              %
            </span>
          </div>
        </div>

        {/* Impacto do reajuste */}
        {hasReaj && base && withReaj && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {(
              [
                ['Soldo',   withReaj.soldo   - base.soldo],
                ['Bruto',   withReaj.bruto   - base.bruto],
                ['Líquido', withReaj.liquido - base.liquido],
              ] as [string, number][]
            ).map(([label, diff]) => (
              <div key={label} className="impact-item">
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="text-green-400 font-mono text-xs font-semibold">
                  {fmtDiff(diff)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── MÉTRICAS RÁPIDAS ───────────────────────────── */}
      {hasResult && active && posto && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Soldo base',
              value: hasReaj && base
                ? (<><span className="line-through text-muted-foreground text-[11px] mr-1">{fmt(base.soldo)}</span>{fmt(active.soldo)}</>)
                : fmt(active.soldo),
            },
            {
              label: 'GRET',
              value: `${posto.gret}×`,
            },
            {
              label: 'Bruto total',
              value: hasReaj && base
                ? (<><span className="line-through text-muted-foreground text-[11px] mr-1">{fmt(base.bruto)}</span>{fmt(active.bruto)}</>)
                : fmt(active.bruto),
            },
            {
              label: 'Líquido',
              value: hasReaj && base
                ? (<><span className="line-through text-muted-foreground text-[11px] block leading-none">{fmt(base.liquido)}</span>{fmt(active.liquido)}</>)
                : fmt(active.liquido),
              green: true,
            },
          ].map(({ label, value, green }) => (
            <div key={label} className="metric-card">
              <div className="metric-label">{label}</div>
              <div className={`metric-value ${green ? 'text-green-400' : ''}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CONTRACHEQUE ───────────────────────────────── */}
      {hasResult && active && posto && (
        <Contracheque
          result={active}
          baseResult={hasReaj ? base : null}
          postoNome={s.postoNome}
          cursoLabel={curso.c}
          ihpLabel={ihpLabel}
          trienios={s.trienios}
          pctTrienioStr={pctTrienioStr}
          reajPct={s.reajPct}
          gretMult={posto.gret}
        />
      )}

      {/* ── AVISO LGPD ─────────────────────────────────── */}
      <div className="lgpd-warning">
        <div className="lgpd-title">
          <AlertTriangle className="w-3.5 h-3.5" />
          Aviso importante
        </div>
        <p className="lgpd-body">
          Esta calculadora é uma ferramenta de uso pessoal e{' '}
          <strong className="text-foreground">não possui vínculo com o CBMERJ</strong>{' '}
          nem com qualquer órgão público. Os valores são <strong className="text-foreground">estimativas de referência</strong> e não
          substituem o contracheque oficial.
        </p>
        <p className="lgpd-body mt-2">
          Esta ferramenta não coleta, armazena nem transmite qualquer informação.
          Ao compartilhar resultados com dados de terceiros, você assume a
          responsabilidade pelo tratamento dessas informações conforme a{' '}
          <strong className="text-foreground">LGPD (Lei nº 13.709/2018)</strong>.
        </p>
      </div>
    </div>
  )
}
