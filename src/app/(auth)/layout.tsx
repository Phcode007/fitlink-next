import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-logo text-3xl font-semibold text-primary">
            FitLink
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-foreground shadow-soft">{children}</div>
      </div>
    </div>
  );
}
