import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10 text-foreground">
      <div className="grid w-full max-w-5xl gap-10 rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur-sm md:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="hidden flex-col justify-center gap-6 border-border/60 pr-0 md:flex md:border-r md:pr-8">
          <Link href="/" className="font-logo text-3xl font-semibold text-primary">
            FitLink
          </Link>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold leading-snug">
              Conecte treino, dieta e acompanhamento profissional em um só lugar.
            </h1>
            <p className="text-base text-foreground/80">
              Acesse planos personalizados, acompanhe seu progresso em tempo real e trabalhe em conjunto com
              nutricionistas e personal trainers.
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Acompanhamento unificado entre treino e nutrição.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Indicadores claros de evolução corpórea.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Experiência pensada para alunos, treinadores e nutricionistas.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <Link href="/" className="font-logo text-2xl font-semibold text-primary">
              FitLink
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-foreground shadow-soft md:p-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
