"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface Field {
  key: "publicKey" | "secretKey" | "webhookSecret";
  label: string;
  placeholder: string;
}

interface Settings {
  provider: string;
  isEnabled: boolean;
  publicKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
}

interface Props {
  provider: string;
  title: string;
  description: string;
  settings: Settings;
  fields: Field[];
}

export function PaymentSettingsForm({ provider, title, description, settings, fields }: Props) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [publicKey, setPublicKey] = useState(settings.publicKey || "");
  const [secretKey, setSecretKey] = useState(settings.secretKey || "");
  const [webhookSecret, setWebhookSecret] = useState(settings.webhookSecret || "");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  const values: Record<string, string> = { publicKey, secretKey, webhookSecret };
  const setValues: Record<string, (v: string) => void> = {
    publicKey: setPublicKey,
    secretKey: setSecretKey,
    webhookSecret: setWebhookSecret,
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, isEnabled, publicKey, secretKey, webhookSecret }),
      });
      if (res.ok) {
        toast({ title: `${title} settings saved` });
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isEnabled ? "bg-restaurant-gold" : "bg-gray-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </div>
          <span className={`text-sm font-semibold ${isEnabled ? "text-restaurant-gold" : "text-gray-400"}`}>
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {fields.length > 0 && (
        <div className="space-y-4 mb-5">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={key === "publicKey" || showSecret ? "text" : "password"}
                  value={values[key]}
                  onChange={(e) => setValues[key](e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-restaurant-gold text-sm pr-10"
                />
                {key !== "publicKey" && (
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-restaurant-gold text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-restaurant-gold/90 transition-colors shadow-sm disabled:opacity-70"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </div>
  );
}
