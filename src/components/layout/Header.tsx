import { Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 no-print">
      <div className="container max-w-5xl h-14 flex items-center gap-3">
        {/* Ícone */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                        bg-gradient-to-br from-fire-red-500 to-ember-500 shadow-lg shadow-fire-red-900/40">
          <Flame className="w-4 h-4 text-white" />
        </div>

        {/* Título */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold tracking-tight text-foreground">
            Calcula Soldo
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-bold tracking-widest border-fire-red-600/50 text-fire-red-400 hidden sm:inline-flex"
          >
            CBMERJ
          </Badge>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Aviso beta */}
        <span className="hidden sm:block text-[11px] text-muted-foreground font-mono">
          estimativas de referência
        </span>
      </div>
    </header>
  )
}
