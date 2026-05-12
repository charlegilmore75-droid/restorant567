import { prisma } from "@/lib/prisma";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { Settings } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettingsPage({ params }: PageProps) {
  const settings = await prisma.siteSettings.findFirst({ where: { id: "singleton" } });

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-restaurant-gold" />
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Site Settings
        </h1>
      </div>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
