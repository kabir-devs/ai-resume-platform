"use client";
import { useState } from "react";

type AnalysisResult = {
  resumeId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  extractedSkills: string[];
};

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/resume/analyze", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Analysis failed");
      return;
    }
    setResult(data);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Resume Analyzer</h1>
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl border mb-8 flex items-center gap-4">
        <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" disabled={!file || loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {result && (
        <div className="bg-white p-6 rounded-xl border space-y-6">
          <div>
            <p className="text-sm text-slate-500">Overall score</p>
            <p className="text-4xl font-extrabold text-brand-600">{result.score}/100</p>
          </div>
          <Section title="Strengths" items={result.strengths} />
          <Section title="Weaknesses" items={result.weaknesses} />
          <Section title="Suggestions" items={result.suggestions} />
          <Section title="Extracted skills" items={result.extractedSkills} />
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

