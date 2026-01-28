"use client";

import { useState } from "react";
import { clsx } from "clsx";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState<number | "">("");
  const [maxViews, setMaxViews] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: any = { content };
      if (ttl) payload.ttl_seconds = Number(ttl);
      if (maxViews) payload.max_views = Number(maxViews);

      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create paste");
      }

      setResult(data);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Pastebin Lite
        </h1>
        <p className="text-gray-400">Share text securely with optional expiry.</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300">
              Content
            </label>
            <textarea
              id="content"
              required
              rows={10}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y font-mono text-sm"
              placeholder="Paste your text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="ttl" className="block text-sm font-medium text-gray-300">
                Expires In (TTL)
              </label>
              <select
                id="ttl"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                value={ttl}
                onChange={(e) => setTtl(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Never</option>
                <option value="60">1 Minute</option>
                <option value="600">10 Minutes</option>
                <option value="3600">1 Hour</option>
                <option value="86400">1 Day</option>
                <option value="604800">1 Week</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="maxViews" className="block text-sm font-medium text-gray-300">
                Max Views (Optional)
              </label>
              <input
                type="number"
                id="maxViews"
                min="1"
                placeholder="e.g. 5"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02]",
              loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25"
            )}
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-center animate-in fade-in slide-in-from-bottom-2">
          {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-green-900/10 border border-green-500/20 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-green-400">Paste Created Successfully!</h3>
            <p className="text-gray-400 text-sm">Share this link with others.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-950 p-2 rounded-lg border border-gray-800">
            <input 
                readOnly 
                value={result.url} 
                className="flex-grow bg-transparent text-gray-300 px-2 outline-none font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
            />
            <button
                onClick={() => navigator.clipboard.writeText(result.url)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-md transition-colors"
            >
                Copy
            </button>
            <a 
                href={result.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-md transition-colors"
            >
                Open
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
