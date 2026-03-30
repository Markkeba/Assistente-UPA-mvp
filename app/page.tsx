import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold">Plantão V3.9</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-gray-400 hover:text-white text-sm transition-colors">
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 text-blue-300 text-sm px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Para médicos plantonistas de UPA e PS
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Documentação médica{" "}
          <span className="text-blue-400">em segundos.</span>
          <br />
          Durante o plantão.
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Assistente de IA que gera os 7 blocos clínicos em tempo real. Para plantonistas que não podem perder tempo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Começar 7 dias grátis
          </Link>
          <a
            href="#como-funciona"
            className="w-full sm:w-auto text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 font-medium px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Ver como funciona
          </a>
        </div>

        <p className="text-gray-600 text-sm mt-4">Sem cartão de crédito. Cancele quando quiser.</p>
      </section>

      {/* Demo preview */}
      <section id="como-funciona" className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-gray-500 text-xs">Plantão V3.9 — Dashboard</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[70%]">
                Homem 45 anos, dor em flanco direito irradiando para virilha, início súbito há 4h, classificação amarela
              </div>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "ANAMNESE",
                  content: "PACIENTE REFERE dor em flanco direito com irradiação para virilha, de início súbito há 4 horas, intensidade 9/10, sem febre. COMORBIDADES: nega. ALERGIAS: nega.",
                },
                {
                  title: "HIPÓTESE DIAGNÓSTICA",
                  content: "Cólica nefrética direita — Urolitíase",
                },
                {
                  title: "CONDUTA",
                  content: "1. Dipirona 1g EV em 100mL SF 0,9% — correr em 20 min\n2. Cetoprofeno 100mg EV em 100mL SF 0,9%\n3. Omeprazol 40mg EV\n4. Bromoprida 10mg EV se náuseas\nPRESCREVO RECEITA AMBULATORIAL. ALTA.",
                },
              ].map((block) => (
                <div key={block.title} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{block.title}</span>
                    <span className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Copiar</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-300 whitespace-pre-line">{block.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Feito para a realidade do plantão
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚡",
              title: "Velocidade",
              description: "Anamnese, conduta e prescrição em menos de 30 segundos. Foco no paciente, não no papel.",
            },
            {
              icon: "🏥",
              title: "Protocolos SUS",
              description: "Condutas alinhadas ao REMUME e fluxos de UPA. Farmacologia correta sem precisar consultar.",
            },
            {
              icon: "📋",
              title: "Pronto para copiar",
              description: "7 blocos formatados para colar direto no sistema. Cada bloco com botão de cópia individual.",
            },
          ].map((benefit) => (
            <div key={benefit.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 blocks */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Os 7 blocos da documentação</h2>
        <p className="text-gray-400 text-center mb-12">Gerados automaticamente a partir do relato do caso</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "Anamnese",
            "Exame Físico",
            "Hipótese Diagnóstica",
            "Conduta",
            "CID-10",
            "Exames Solicitados",
            "Prescrição Ambulatorial",
          ].map((block, i) => (
            <div key={block} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-center">
              <span className="text-blue-400 font-mono text-xs">0{i + 1}</span>
              <p className="text-sm text-gray-300 mt-1 font-medium">{block}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Um plano simples</h2>
        <p className="text-gray-400 mb-12">Sem surpresas, sem planos confusos</p>

        <div className="max-w-sm mx-auto bg-gray-900 border border-blue-500/50 rounded-2xl p-8">
          <div className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">
            Plantão Pro
          </div>
          <div className="flex items-end justify-center gap-1 mb-1">
            <span className="text-2xl text-gray-400 font-medium">R$</span>
            <span className="text-6xl font-bold">97</span>
            <span className="text-gray-400 mb-2">/mês</span>
          </div>
          <p className="text-gray-500 text-sm mb-8">7 dias grátis, cancele quando quiser</p>

          <ul className="space-y-3 text-left mb-8">
            {[
              "Documentação ilimitada",
              "Streaming em tempo real",
              "7 blocos copiáveis",
              "Histórico de consultas",
              "Protocolos SUS atualizados",
              "Suporte por email",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/auth/register"
            className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-gray-600 text-sm">© 2024 Plantão V3.9. Todos os direitos reservados.</span>
          <nav className="flex items-center gap-6">
            <Link href="/termos" className="text-gray-600 hover:text-gray-400 text-sm">Termos de uso</Link>
            <Link href="/privacidade" className="text-gray-600 hover:text-gray-400 text-sm">Privacidade</Link>
            <a href="mailto:contato@plantaov39.com.br" className="text-gray-600 hover:text-gray-400 text-sm">Contato</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
