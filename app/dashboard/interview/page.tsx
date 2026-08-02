"use client";
import { useState } from "react";

type Question = { question: string; type: string; tip: string };

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/interview/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Generation failed"); return; }
    setQuestions(data.questions);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Interview Question Generator</h1>
      <form onSubmit={generate} className="bg-white p-6 rounded-xl border mb-8 flex gap-4">
        <input placeholder="Target role, e.g. Senior Backend Engineer" value={role}
          onChange={(e) => setRole(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" required />
        <button type="submit" disabled={loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border">
            <span className="text-xs uppercase font-semibold text-brand-600">{q.type}</span>
            <p className="font-medium mt-1">{q.question}</p>
            <p className="text-sm text-slate-500 mt-1">💡 {q.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

