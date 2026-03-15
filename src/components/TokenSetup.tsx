"use client";

import { useState } from "react";
import { setStoredToken } from "@/lib/useOuraData";

interface TokenSetupProps {
  onTokenSet: () => void;
}

export default function TokenSetup({ onTokenSet }: TokenSetupProps) {
  const [token, setToken] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (token.trim()) {
      setStoredToken(token.trim());
      onTokenSet();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center -ml-56">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            Oura Dashboard
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Enter your Oura Personal Access Token to get started.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your token here..."
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-blue)]"
            />
          </div>
          <button
            type="submit"
            disabled={!token.trim()}
            className="w-full py-3 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect Oura Ring
          </button>
        </form>
        <p className="text-[10px] text-[var(--text-secondary)] text-center mt-4">
          Your token is stored locally in your browser and never sent to our servers.
        </p>
      </div>
    </div>
  );
}
