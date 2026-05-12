import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminLogsPage({ params, searchParams }: PageProps) {
  const { page = "1" } = await searchParams;
  const take = 30;
  const skip = (parseInt(page) - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.adminLog.count(),
  ]);

  const { locale } = await params;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-restaurant-gold" />
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Activity Logs
        </h1>
        <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          {total} entries
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Time</th>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Action</th>
                <th className="px-6 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-900">{log.user.name}</p>
                    <p className="text-xs text-gray-400">{log.user.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No activity logs yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {total > take && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {logs.length} of {total}</span>
            <div className="flex gap-2">
              {parseInt(page) > 1 && (
                <a href={`/${locale}/admin/logs?page=${parseInt(page) - 1}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Previous</a>
              )}
              {logs.length === take && (
                <a href={`/${locale}/admin/logs?page=${parseInt(page) + 1}`} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">Next</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
