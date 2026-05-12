import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminUserActions } from "@/components/admin/user-actions";
import { Users } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page = "1", search } = await searchParams;
  const session = await auth();
  const currentRole = (session?.user as { role?: string })?.role;
  const take = 20;
  const skip = (parseInt(page) - 1) * take;

  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    } : {},
    orderBy: { createdAt: "desc" },
    take,
    skip,
    select: {
      id: true, name: true, email: true, role: true, walletBalance: true,
      createdAt: true, _count: { select: { orders: true } },
    },
  });

  const total = await prisma.user.count();

  const roleColor = (role: string) => {
    if (role === "SUPERADMIN") return "bg-purple-100 text-purple-700";
    if (role === "ADMIN") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-restaurant-gold" />
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Users Management
        </h1>
        <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          {total} total
        </span>
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or email..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm shadow-sm"
        />
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Wallet</th>
                <th className="px-6 py-3 text-left">Orders</th>
                <th className="px-6 py-3 text-left">Joined</th>
                {currentRole === "SUPERADMIN" && <th className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-restaurant-gold/10 flex items-center justify-center text-restaurant-gold font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(user.walletBalance)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user._count.orders}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  {currentRole === "SUPERADMIN" && (
                    <td className="px-6 py-4 text-center">
                      <AdminUserActions userId={user.id} currentRole={user.role} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {users.length} of {total} users</span>
          <div className="flex gap-2">
            {parseInt(page) > 1 && (
              <a href={`/${locale}/admin/users?page=${parseInt(page) - 1}${search ? `&search=${search}` : ""}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Previous</a>
            )}
            {users.length === take && (
              <a href={`/${locale}/admin/users?page=${parseInt(page) + 1}${search ? `&search=${search}` : ""}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Next</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
