import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChatInterface } from "@/components/ChatInterface";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if trial expired
  const isTrialExpired =
    profile?.subscription_status === "trial" &&
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at) <= new Date();

  if (isTrialExpired) {
    await supabase
      .from("profiles")
      .update({ subscription_status: "expired" })
      .eq("id", user.id);
  }

  const isBlocked =
    profile?.subscription_status === "expired" ||
    profile?.subscription_status === "canceled" ||
    isTrialExpired;

  const isActive = !isBlocked;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white font-bold text-lg">
            Plantão V3.9
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            profile?.subscription_status === "active"
              ? "bg-green-900/50 text-green-400 border border-green-700/50"
              : profile?.subscription_status === "trial"
              ? "bg-blue-900/50 text-blue-400 border border-blue-700/50"
              : "bg-red-900/50 text-red-400 border border-red-700/50"
          }`}>
            {profile?.subscription_status === "active"
              ? "Pro"
              : profile?.subscription_status === "trial"
              ? "Trial"
              : "Expirado"}
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard/historico"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Histórico
          </Link>
          <Link
            href="/dashboard/conta"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Conta
          </Link>
        </nav>
      </header>

      {/* Trial banner */}
      {profile && (
        <SubscriptionBanner
          trialEndsAt={profile.trial_ends_at}
          status={profile.subscription_status}
        />
      )}

      {/* Upgrade success notice */}
      {searchParams.upgraded && (
        <div className="bg-green-900/40 border-b border-green-700/50 px-4 py-2.5 text-center">
          <p className="text-green-300 text-sm font-medium">
            Assinatura ativada com sucesso! Bem-vindo ao Plantão V3.9 Pro.
          </p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden max-w-4xl w-full mx-auto">
        <ChatInterface isBlocked={isBlocked} />
      </main>
    </div>
  );
}
