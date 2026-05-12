import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdminSupportThread } from "@/components/admin/support-thread";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSupportPage({ params }: PageProps) {
  const threads = await prisma.supportThread.findMany({
    include: {
      user: { select: { name: true, email: true } },
      messages: {
        include: { sender: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Support Messages
      </h1>

      <div className="space-y-4">
        {threads.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
            No support threads yet.
          </div>
        ) : (
          threads.map((thread) => (
            <AdminSupportThread key={thread.id} thread={thread} />
          ))
        )}
      </div>
    </div>
  );
}
