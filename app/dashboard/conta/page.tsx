"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface Profile {
  nome: string;
  email: string;
  crm: string;
  subscription_status: string;
  trial_ends_at: string | null;
  stripe_subscription_id: string | null;
}

export default function ContaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handlePortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setCheckoutLoading(false);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    trial: "Trial ativo",
    active: "Assinatura ativa",
    canceled: "Cancelada",
    past_due: "Pagamento pendente",
    expired: "Trial expirado",
  };

  const statusColor: Record<string, string> = {
    trial: "text-blue-400",
    active: "text-green-400",
    canceled: "text-red-400",
    past_due: "text-yellow-400",
    expired: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-white font-semibold">Minha conta</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Dados pessoais</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Nome</p>
              <p className="text-gray-200">{profile?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <p className="text-gray-200">{profile?.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">CRM</p>
              <p className="text-gray-200">{profile?.crm || "—"}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Assinatura</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Status</p>
              <p className={`font-medium ${statusColor[profile?.subscription_status || "trial"]}`}>
                {statusLabel[profile?.subscription_status || "trial"]}
              </p>
            </div>
            {profile?.subscription_status === "trial" && profile?.trial_ends_at && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">Trial termina em</p>
                <p className="text-gray-300 text-sm">
                  {new Date(profile.trial_ends_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </div>

          {profile?.subscription_status === "active" ? (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 border border-gray-700"
            >
              {portalLoading ? "Abrindo portal..." : "Gerenciar assinatura"}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {checkoutLoading ? "Redirecionando..." : "Assinar — R$ 97/mês"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Conta</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/historico"
              className="flex items-center justify-between text-gray-300 hover:text-white transition-colors"
            >
              <span className="text-sm">Ver histórico de consultas</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <hr className="border-gray-800" />
            <button
              onClick={handleSignOut}
              className="flex items-center justify-between w-full text-red-400 hover:text-red-300 transition-colors"
            >
              <span className="text-sm">Sair da conta</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
