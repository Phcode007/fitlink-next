import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default async function ProfilePage() {
  const user = await api.users.getMe().catch(() => null);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <Card>
        {user ? (
          <div className="grid gap-2 text-base">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Perfil:</span> {user.role}
            </p>
            <p>
              <span className="font-medium">Status:</span> {user.isActive ? "Ativo" : "Inativo"}
            </p>
          </div>
        ) : (
          <p className="text-sm">Nao foi possivel carregar seu perfil.</p>
        )}
      </Card>
    </div>
  );
}
