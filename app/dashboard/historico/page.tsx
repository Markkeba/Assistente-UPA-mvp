import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoricoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: consultas } = await supabase
    .from("consultas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-white font-semibold">Histórico de consultas</h1>
        </div>
        <Link href="/dashboard/conta" className="text-gray-400 hover:text-white text-sm">Conta</Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!consultas || consultas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400">Nenhuma consulta ainda.</p>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
              Ir para o dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {consultas.map((consulta) => (
              <div key={consulta.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 line-clamp-2 font-medium">
                      {consulta.input}
                    </p>
                    {consulta.output && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {consulta.output.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {new Date(consulta.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {consulta.tokens_used && (
                      <p className="text-xs text-gray-600 mt-0.5">{consulta.tokens_used} tokens</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
