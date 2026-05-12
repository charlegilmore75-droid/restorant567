import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";
import { Users, ShoppingBag, DollarSign, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getStats() {
  const [totalUsers, totalOrders, pendingOrders, revenue, recentOrders] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" }, isPaid: true }, _sum: { total: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, items: { include: { product: true } } },
    }),
  ]);
  return { totalUsers, totalOrders, pendingOrders, revenue: revenue._sum.total || 0, recentOrders };
}

export default async function AdminDashboard({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  const { totalUsers, totalOrders, pendingOrders, revenue, recentOrders } = await getStats();

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "bg-blue-500", change: "+12% this month" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "bg-restaurant-gold", change: "+8% this month" },
    { label: "Revenue", value: formatCurrency(revenue), icon: DollarSign, color: "bg-green-500", change: "+15% this month" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "bg-orange-500", change: "Needs attention" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xs text-green-500 mt-2">{change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href={`/${locale}/admin/orders`} className="text-sm text-restaurant-gold hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Order</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 text-sm">#{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
