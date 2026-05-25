export function Footer() {
  const ano = new Date().getFullYear()
  return (
    <footer className="border-t border-border py-6 no-print">
      <div className="container max-w-5xl text-center">
        <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
          calcula-soldo · {ano} · ferramenta não oficial · sem vínculo com o CBMERJ
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          não coleta, armazena nem transmite dados · use com responsabilidade
        </p>
      </div>
    </footer>
  )
}
