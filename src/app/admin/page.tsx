import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/campeonatos");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-1 items-center px-4 py-16">
      <AdminLoginForm />
    </div>
  );
}
