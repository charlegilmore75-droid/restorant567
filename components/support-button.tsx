"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MessageCircle } from "lucide-react";

export function SupportButton() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/support`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-restaurant-gold text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium text-sm"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:block">{t("support")}</span>
    </Link>
  );
}
