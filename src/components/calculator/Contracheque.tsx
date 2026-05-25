'use client'

import { Printer, Copy, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { fmt } from '@/lib/utils'
import { printContracheque, buildShareText, copyToClipboard } from '@/lib/export'
import type { CalcResult } from '@/types'

interface ContrachequeProps {
  result: CalcResult
  baseResult?: CalcResult | null
  postoNome: string
  cursoLabel: string
  ihpLabel: string
  trienios: number
  pctTrienioStr: string
  reajPct: number
  gretMult: number
}

export function Contracheque({
  result: r,
  baseResult: base,
  postoNome,
  cursoLabel,
  ihpLabel,
  trienios,
  pctTrienioStr,
  reajPct,
  gretMult,
}: ContrachequeProps) {
  const [copied, setCopied] = useState(false)
  const ano = new Date().getFullYear()
  const hasReaj = reajPct > 0

  function ProvRow({
    label,
    value,
    oldValue,
  }: {
    label: string
    value: number
    oldValue?: number
  }) {
    const changed = hasReaj && oldValue !== undefined && Math.abs(value - oldValue) > 0.01
    return (
      <div className="cb-row">
        <span className="cb-row-label">{label}</span>
        <span className="cb-row-value">
          {changed && (
            <span className="line-through text-muted-foreground text-[11px] mr-1.5">
              {fmt(oldValue!)}
            </span>
          )}
          <span className={changed ? 'text-green-400' : ''}>{fmt(value)}</span>
        </span>
      </div>
    )
  }

  function DescRow({
    label,
    value,
    oldValue,
  }: {
    label: string
    value: number
    oldValue?: number
  }) {
    const changed = hasReaj && oldValue !== undefined && Math.abs(value - oldValue) > 0.01
    return (
      <div className="cb-row">
        <span className="cb-row-label">{label}</span>
        <span className="cb-row-value text-red-400">
          {changed && (
            <span className="line-through text-muted-foreground text-[11px] mr-1.5">
              {fmt(oldValue!)}
            </span>
          )}
          {fmt(value)}
        </span>
      </div>
    )
  }

  async function handleCopy() {
    const text = buildShareText({
      postoNome,
      cursoLabel,
      soldo: r.soldo,
      bruto: r.bruto,
      totalDesc: r.totalDesc,
      liquido: r.liquido,
      reajPct,
      fmt,
    })
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="contracheque" id="contracheque-section">
      {/* Cabeçalho */}
      <div className="contracheque-header">
        <div>
          <div className="contracheque-org">CBMERJ</div>
          <div className="contracheque-sub">
            {postoNome} · {cursoLabel} · {ano}
            {hasReaj && (
              <span className="ml-2 text-green-400">
                Simulação +{reajPct.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        {/* Botões de exportação */}
        <div className="flex items-center gap-2 no-print">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <><CheckCheck className="w-3.5 h-3.5 text-green-400" /> Copiado</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copiar</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={printContracheque}
          >
            <Printer className="w-3.5 h-3.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Corpo — proventos e descontos */}
      <div className="contracheque-body">
        {/* Proventos */}
        <div className="cb-col sm:border-r border-border">
          <h4 className="cb-col-title">Proventos</h4>
          <ProvRow label="Soldo base" value={r.soldo} oldValue={base?.soldo} />
          <ProvRow
            label={`GRET (${gretMult}×)`}
            value={r.gret}
            oldValue={base?.gret}
          />
          {r.ihp > 0 && (
            <ProvRow
              label={ihpLabel || `IHP (${(r.ihp / r.soldo * 100).toFixed(0)}%)`}
              value={r.ihp}
              oldValue={base?.ihp}
            />
          )}
          <ProvRow label="GRAM (62,5%)" value={r.gram} oldValue={base?.gram} />
          {trienios > 0 && (
            <ProvRow
              label={`Triênio (${trienios}º — ${pctTrienioStr})`}
              value={r.trienioVal}
              oldValue={base?.trienioVal}
            />
          )}
          <ProvRow label="Vale transporte" value={r.valeTransp} />
        </div>

        {/* Descontos */}
        <div className="cb-col border-t sm:border-t-0 border-border">
          <h4 className="cb-col-title">Descontos</h4>
          <DescRow
            label={`Fundo de saúde (${(r.pctFundo * 100).toFixed(0)}%)`}
            value={r.fundoSaude}
            oldValue={base?.fundoSaude}
          />
          <DescRow
            label="Previdência SPSMERJ (10,5%)"
            value={r.prev}
            oldValue={base?.prev}
          />
          <DescRow label="IRPF" value={r.ir} oldValue={base?.ir} />
        </div>
      </div>

      {/* Totais */}
      <div className="contracheque-totais">
        <div className="cb-tot border-r border-border">
          <span className="text-muted-foreground">Total proventos</span>
          <span className="font-mono font-semibold">{fmt(r.bruto)}</span>
        </div>
        <div className="cb-tot">
          <span className="text-muted-foreground">Total descontos</span>
          <span className="font-mono font-semibold text-red-400">
            {fmt(r.totalDesc)}
          </span>
        </div>
      </div>

      {/* Rodapé — líquido */}
      <div className="contracheque-footer">
        <span className="text-sm text-muted-foreground">Salário líquido a receber</span>
        <span className="contracheque-liquido">{fmt(r.liquido)}</span>
      </div>
    </div>
  )
}
