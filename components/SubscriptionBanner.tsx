"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubscriptionBannerProps {
  trialEndsAt: string | null;
  status: string;
}

export function SubscriptionBanner({ trialEndsAt, status }: SubscriptionBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "active") return null;

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  }

  if (status === "trial" && daysLeft > 0) {
    return (
      <div className="bg-amber-900/40 border-b border-amber-700/50 px-4 py-2.5 flex items-center justify-between">
        <p className="text-amber-300 text-sm">
          Seu trial termina em <strong>{daysLeft} {daysLeft === 1 ? "dia" : "dias"}</strong>
        </p>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="text-sm bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Assinar agora — R$ 97/mês"}
        </button>
      </div>
    );
  }

  return null;
}
