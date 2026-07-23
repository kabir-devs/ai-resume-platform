import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-extrabold tracking-tight mb-6">
        Land your next job with <span className="text-brand-600">AI-powered</span> resume feedback
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
        Upload your CV, get instant AI analysis, generate tailored interview questions,
        and chat with a career coach — all in one platform.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/register" className="bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700">
          Start free
        </Link>
        <Link href="/pricing" className="border border-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100">
          View pricing
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
        {[
          { title: "AI Resume Analysis", desc: "Get a score, strengths, weaknesses, and concrete suggestions in seconds." },
          { title: "Interview Question Generator", desc: "Practice with role-specific behavioral and technical questions." },
          { title: "Career Coach Chat", desc: "Ask follow-up questions and get personalized guidance anytime." },
        ].map((f) => (
          <div key={f.title} className="bg-white p-6 rounded-xl border">
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
