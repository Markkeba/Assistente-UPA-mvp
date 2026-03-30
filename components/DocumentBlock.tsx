"use client";

import { useState } from "react";

interface DocumentBlockProps {
  title: string;
  content: string;
}

export function DocumentBlock({ title, content }: DocumentBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-750 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
          {title}
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copiado!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copiar
            </>
          )}
        </button>
      </div>
      <div className="px-4 py-3">
        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}
