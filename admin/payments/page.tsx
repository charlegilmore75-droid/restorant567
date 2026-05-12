import { prisma } from "@/lib/prisma";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { CreditCard } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPaymentsPage({ params }: PageProps) {
  const payments = await prisma.paymentSettings.findMany({
    orderBy: { provider: "asc" },
  });

  const stripe = payments.find((p) => p.provider === "stripe") || { provider: "stripe", isEnabled: false, publicKey: null, secretKey: null, webhookSecret: null };
  const paypal = payments.find((p) => p.provider === "paypal") || { provider: "paypal", isEnabled: false, publicKey: null, secretKey: null, webhookSecret: null };
  const cash = payments.find((p) => p.provider === "cash") || { provider: "cash", isEnabled: true, publicKey: null, secretKey: null, webhookSecret: null };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-6 h-6 text-restaurant-gold" />
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Payment Settings
        </h1>
      </div>

      <div className="space-y-6">
        <PaymentSettingsForm
          provider="cash"
          title="Cash on Delivery"
          description="Accept cash payments upon delivery. No API keys needed."
          settings={cash as { provider: string; isEnabled: boolean; publicKey: string | null; secretKey: string | null; webhookSecret: string | null }}
          fields={[]}
        />
        <PaymentSettingsForm
          provider="stripe"
          title="Stripe"
          description="Accept credit/debit card payments via Stripe."
          settings={stripe as { provider: string; isEnabled: boolean; publicKey: string | null; secretKey: string | null; webhookSecret: string | null }}
          fields={[
            { key: "publicKey", label: "Publishable Key", placeholder: "pk_live_..." },
            { key: "secretKey", label: "Secret Key", placeholder: "sk_live_..." },
            { key: "webhookSecret", label: "Webhook Secret", placeholder: "whsec_..." },
          ]}
        />
        <PaymentSettingsForm
          provider="paypal"
          title="PayPal"
          description="Accept PayPal payments."
          settings={paypal as { provider: string; isEnabled: boolean; publicKey: string | null; secretKey: string | null; webhookSecret: string | null }}
          fields={[
            { key: "publicKey", label: "Client ID", placeholder: "PayPal Client ID" },
            { key: "secretKey", label: "Client Secret", placeholder: "PayPal Client Secret" },
          ]}
        />
      </div>
    </div>
  );
}
