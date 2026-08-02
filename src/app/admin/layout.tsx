import Link from "next/link";
import { logoutAdmin } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div>
      {authed && (
        <div className="border-b border-fiesta-ink/20 bg-fiesta-yellow/30">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
            <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-wide">
              <Link href="/admin/campeonatos" className="hover:text-fiesta-magenta">
                Campeonatos
              </Link>
              <Link href="/" className="hover:text-fiesta-magenta">
                Ver web
              </Link>
            </div>
            <form action={logoutAdmin}>
              <Button type="submit" size="sm" variant="outline">
                Salir
              </Button>
            </form>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
