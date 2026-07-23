"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: messages }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setMessages([...newMessages, { role: "assistant", content: data.reply }]);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[70vh]">
      <h1 className="text-2xl font-bold mb-4">Career Coach Chat</h1>
      <div className="flex-1 overflow-y-auto bg-white border rounded-xl p-4 space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm">Ask about your resume, interview prep, or career strategy.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={`inline-block px-4 py-2 rounded-2xl text-sm ${
              m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
            }`}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-slate-400 text-sm">Thinking...</p>}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..." className="flex-1 border rounded-lg px-3 py-2" />
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700">
          Send
        </button>
      </form>
    </div>
  );
}
