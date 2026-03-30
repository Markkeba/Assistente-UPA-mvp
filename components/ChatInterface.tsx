"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentBlock } from "./DocumentBlock";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BLOCK_TITLES: Record<string, string> = {
  ANAMNESE: "ANAMNESE",
  "EXAME FÍSICO": "EXAME FÍSICO",
  "HIPÓTESE DIAGNÓSTICA": "HIPÓTESE DIAGNÓSTICA",
  CONDUTA: "CONDUTA",
  "CID-10": "CID-10",
  "EXAMES SOLICITADOS": "EXAMES SOLICITADOS",
  "PRESCRIÇÃO AMBULATORIAL": "PRESCRIÇÃO AMBULATORIAL",
};

function parseBlocks(text: string): { title: string; content: string }[] | null {
  const blockPattern = /###\s+([\wÀ-ÿ\s\-\/]+)\n([\s\S]*?)(?=###\s+[\wÀ-ÿ\s\-\/]+\n|$)/g;
  const blocks: { title: string; content: string }[] = [];
  let match;

  while ((match = blockPattern.exec(text)) !== null) {
    const title = match[1].trim().toUpperCase();
    if (BLOCK_TITLES[title] !== undefined) {
      blocks.push({ title, content: match[2].trim() });
    }
  }

  return blocks.length >= 3 ? blocks : null;
}

interface ChatInterfaceProps {
  isBlocked: boolean;
}

export function ChatInterface({ isBlocked }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || streaming || isBlocked) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setStreamingText("");
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.status === 402) {
        setError("Sua assinatura expirou. Assine para continuar.");
        setStreaming(false);
        return;
      }

      if (!res.ok) {
        setError("Erro na conexão. Tente novamente.");
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamingText(accumulated);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulated },
      ]);
      setStreamingText("");
    } catch {
      setError("Erro na conexão. Tente novamente.");
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  }

  async function copyAll(content: string) {
    await navigator.clipboard.writeText(content);
  }

  function renderMessage(msg: Message, index: number) {
    if (msg.role === "user") {
      return (
        <div key={index} className="flex justify-end">
          <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
            {msg.content}
          </div>
        </div>
      );
    }

    const blocks = parseBlocks(msg.content);

    if (blocks) {
      return (
        <div key={index} className="space-y-3">
          {blocks.map((block, i) => (
            <DocumentBlock key={i} title={block.title} content={block.content} />
          ))}
          <button
            onClick={() => copyAll(msg.content)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800 border border-gray-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar tudo
          </button>
        </div>
      );
    }

    return (
      <div key={index} className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap max-w-[90%]">
        {msg.content}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Pronto para documentar
            </h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Descreva o caso do paciente abaixo. Informe queixa principal, idade, sexo e classificação de risco para começar.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-sm">
              {[
                "Homem 45 anos, dor abdominal em cólica há 6h, manchete amarelo",
                "Mulher 28 anos, dor de cabeça há 2 dias, classificação verde",
                "Criança 5 anos, febre 39°C há 3 dias, manchete amarelo",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs text-gray-400 hover:text-gray-200 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => renderMessage(msg, i))}

        {streaming && streamingText && (
          <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap max-w-[90%]">
            {streamingText}
            <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 animate-pulse" />
          </div>
        )}

        {streaming && !streamingText && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            Gerando documentação...
          </div>
        )}

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {isBlocked ? (
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/80 rounded-2xl p-6 text-center">
            <p className="text-gray-300 font-medium mb-1">Seu trial expirou</p>
            <p className="text-gray-500 text-sm mb-4">Assine para continuar gerando documentação médica</p>
            <button
              onClick={async () => {
                const res = await fetch("/api/stripe/checkout", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Assinar — R$ 97/mês
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva o caso: queixa, idade, sexo, risco..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1.5 text-right">
            Cmd+Enter para enviar
          </p>
        </form>
      )}
    </div>
  );
}
