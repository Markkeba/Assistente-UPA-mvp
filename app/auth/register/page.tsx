"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [crm, setCrm] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, crm },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Update profile with nome and crm
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ nome, crm })
        .eq("id", data.user.id);
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Plantão V3.9</h1>
          <p className="text-gray-400 mt-2">Crie sua conta — 7 dias grátis</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dr. João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">CRM</label>
            <input
              type="text"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CRM/SP 123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Criando conta..." : "Começar 7 dias grátis"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Já tem conta?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Entrar
            </Link>
          </p>

          <p className="text-center text-gray-500 text-xs">
            Ao criar conta, você concorda com nossos{" "}
            <Link href="/termos" className="underline">Termos de Uso</Link> e{" "}
            <Link href="/privacidade" className="underline">Política de Privacidade</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
