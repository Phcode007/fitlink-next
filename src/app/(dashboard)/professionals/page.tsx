import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProfessionalSearch } from "@/components/professionals/ProfessionalSearch";
import { getSession } from "@/lib/auth";

export default async function ProfessionalsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "USER") {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Buscar profissionais</h1>
        <p className="text-base">Pesquise profissionais de nutrição e educação física cadastrados na plataforma.</p>
      </div>

      <Card>
        <ProfessionalSearch />
      </Card>
    </div>
  );
}
