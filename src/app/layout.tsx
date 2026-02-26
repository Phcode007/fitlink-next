import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "FitLink",
  description: "Plataforma SaaS premium de fitness para usuários e especialistas.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground antialiased">
        <AuthProvider initialSession={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
