import type { Metadata, Viewport } from 'next'
import { Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Calcula Soldo — CBMERJ',
  description:
    'Simulador de vencimentos do Corpo de Bombeiros Militar do Estado do Rio de Janeiro. ' +
    'Calcule soldo, GRET, IHP, GRAM, triênios, descontos e salário líquido.',
  keywords: ['CBMERJ', 'vencimento', 'soldo', 'bombeiro', 'militar', 'Rio de Janeiro', 'calculadora'],
  authors: [{ name: 'calcula-soldo' }],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  themeColor: '#0b0d12',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${syne.variable} ${jetbrainsMono.variable} min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
