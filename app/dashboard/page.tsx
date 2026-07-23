import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const cards = [
    { href: "/dashboard/resume", title: "Analyze a resume", desc: "Upload a CV and get AI-powered feedback." },
    { href: "/dashboard/interview", title: "Interview prep", desc: "Generate role-specific interview questions." },
    { href: "/dashboard/chat", title: "Career coach chat", desc: "Ask questions and get personalized guidance." },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome back, {session.user?.name}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="bg-white p-6 rounded-xl border hover:shadow-md transition">
            <h3 className="font-bold text-lg mb-2">{c.title}</h3>
            <p className="text-slate-600 text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
