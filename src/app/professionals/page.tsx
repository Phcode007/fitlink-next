import { Card } from "@/components/ui/Card";
import { ProfessionalSearch } from "@/components/professionals/ProfessionalSearch";

export default function ProfessionalsPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold">Buscar profissionais</h1>
        <p className="text-base">Pesquise profissionais de nutricao e educacao fisica cadastrados na plataforma.</p>
      </div>

      <Card>
        <ProfessionalSearch />
      </Card>
    </div>
  );
}
