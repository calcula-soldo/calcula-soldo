/**
 * Dispara o diálogo de impressão do browser.
 * O @media print no globals.css oculta tudo exceto #contracheque-section.
 */
export function printContracheque(): void {
  window.print()
}

/**
 * Copia o resumo do contracheque para a área de transferência.
 * Útil para compartilhar via WhatsApp/Telegram.
 */
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

/**
 * Monta texto resumido do contracheque para cópia/compartilhamento.
 */
export function buildShareText(params: {
  postoNome: string
  cursoLabel: string
  soldo: number
  bruto: number
  totalDesc: number
  liquido: number
  reajPct: number
  fmt: (v: number) => string
}): string {
  const { postoNome, cursoLabel, soldo, bruto, totalDesc, liquido, reajPct, fmt } = params
  const reajStr = reajPct > 0 ? ` (+${reajPct.toFixed(2)}% reajuste)` : ''
  const lines = [
    `📋 Calcula Soldo — CBMERJ${reajStr}`,
    `Posto: ${postoNome} / ${cursoLabel}`,
    ``,
    `Soldo base:  ${fmt(soldo)}`,
    `Bruto total: ${fmt(bruto)}`,
    `Descontos:   ${fmt(totalDesc)}`,
    `─────────────────────`,
    `💰 Líquido:  ${fmt(liquido)}`,
    ``,
    `⚠️ Estimativa de referência. Não substitui o contracheque oficial.`,
  ]
  return lines.join('\n')
}
