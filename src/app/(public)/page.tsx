import Image from "next/image";
import Link from "next/link";

const imagensDestaque = [
  {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    alt: "Pessoa treinando com pesos na academia",
    titulo: "Treino orientado por especialistas",
    descricao: "Planos de treino personalizados com acompanhamento continuo.",
  },
  {
    src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    alt: "Refeicao saudavel organizada em marmitas",
    titulo: "Planejamento alimentar inteligente",
    descricao: "Dietas praticas para sua rotina, com metas nutricionais claras.",
  },
  {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80",
    alt: "Pessoa conferindo metricas de evolucao no celular",
    titulo: "Evolucao visivel em dados",
    descricao: "Acompanhe peso, composicao corporal e resultados em tempo real.",
  },
];

export default function HomePage() {
  return (
    <div className="grid gap-10 py-8">
      <section className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="grid gap-6">
          <span className="inline-flex w-fit rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            Plataforma premium para transformacao fisica
          </span>
          <h1 className="text-2xl font-semibold sm:text-4xl">Treino, dieta e progresso conectados em uma unica experiencia</h1>
          <p className="max-w-xl text-base">
            O FitLink une usuarios, personal trainers e nutricionistas em uma jornada completa para conquistar resultados reais com suporte profissional.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-soft active:translate-y-0 active:scale-[0.98]"
            >
              Comecar agora
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-border px-5 py-3 font-medium shadow-sm transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-muted hover:shadow-soft active:translate-y-0 active:scale-[0.98]"
            >
              Ja tenho conta
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <Image
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80"
            alt="Grupo treinando em ambiente moderno"
            width={1400}
            height={900}
            className="h-72 w-full rounded-xl object-cover sm:h-80"
            priority
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {imagensDestaque.map((item) => (
          <article key={item.titulo} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <Image
              src={item.src}
              alt={item.alt}
              width={1200}
              height={800}
              className="mb-4 h-44 w-full rounded-xl object-cover"
              loading="lazy"
            />
            <h2 className="mb-2 text-lg font-semibold">{item.titulo}</h2>
            <p className="text-base">{item.descricao}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-muted p-6 shadow-soft">
        <h2 className="mb-3 text-2xl font-semibold">Para quem e o FitLink?</h2>
        <p className="text-base">
          Para voce que deseja emagrecer, ganhar massa muscular ou melhorar sua saude com acompanhamento profissional e uma plataforma feita para evolucao constante.
        </p>
      </section>
    </div>
  );
}
