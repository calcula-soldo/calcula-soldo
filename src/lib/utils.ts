import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata valor como moeda BRL */
export function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Formata diferença positiva como moeda BRL com sinal */
export function fmtDiff(value: number): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return value >= 0 ? `+ ${formatted}` : `- ${formatted}`
}

/** Formata percentual */
export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}
