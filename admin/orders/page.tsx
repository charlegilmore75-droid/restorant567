import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";
import { AdminOrderActions } from "@/components/admin/order-actions";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { status, page = "1" } = await searchParams;
  const session = await auth();
  const take = 20;
  const skip = (parseInt(page) - 1) * take;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : {},
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  const total = await prisma.order.count({ where: status ? { status: status as never } : {} });
  const statuses = ["PENDING", "DELAYED", "SENT", "RECEIVED", "CANCELLED"];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Orders Management
      </h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <a href={`/${locale}/admin/orders`} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!status ? "bg-restaurant-gold text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
          All ({await prisma.order.count()})
        </a>
        {statuses.map((s) => (
          <a key={s} href={`/${locale}/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${status === s ? "bg-restaurant-gold text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>
            {s}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Order</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 text-sm">#{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 max-w-[200px] truncate">
                    {order.items.map(i => `${i.product.name} ×${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4 text-center">
                    <AdminOrderActions orderId={order.id} currentStatus={order.status} userId={order.userId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {orders.length} of {total} orders</span>
          <div className="flex gap-2">
            {parseInt(page) > 1 && (
              <a href={`/${locale}/admin/orders?page=${parseInt(page) - 1}${status ? `&status=${status}` : ""}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Previous</a>
            )}
            {orders.length === take && (
              <a href={`/${locale}/admin/orders?page=${parseInt(page) + 1}${status ? `&status=${status}` : ""}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Next</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
