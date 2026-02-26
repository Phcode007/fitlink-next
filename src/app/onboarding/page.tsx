import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { getSession } from "@/lib/auth";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl items-center px-4 py-8">
      <Card className="w-full" padding="lg">
        <OnboardingForm role={session.role} />
      </Card>
    </div>
  );
}
