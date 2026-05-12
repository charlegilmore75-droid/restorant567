import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "SUPERADMIN")) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar locale={locale} role={role as string} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
