import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-muted/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-logo text-xl font-semibold text-primary">
            FitLink
          </Link>
          <div className="flex items-center gap-4 text-base">
            <Link href="/login" className="hover:text-primary">
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary px-4 py-2 text-white shadow-sm transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-soft active:translate-y-0 active:scale-[0.98]"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      <footer className="border-t border-border bg-muted/70">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
          <div className="grid gap-2">
            <p className="font-logo text-xl font-semibold text-primary">FitLink</p>
            <p className="text-sm">Plataforma para treino, dieta e evolucao com apoio profissional.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="font-semibold">Navegacao</p>
            <Link href="/register" className="hover:text-primary">
              Criar conta
            </Link>
            <Link href="/login" className="hover:text-primary">
              Entrar
            </Link>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="font-semibold">Contato</p>
            <p>suporte@fitlink.com</p>
            <p>(11) 4000-0000</p>
          </div>
        </div>
        <div className="border-t border-border/70 px-6 py-4 text-center text-sm">{anoAtual} FitLink. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
