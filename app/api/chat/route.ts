import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatReply } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const { message, history } = await req.json();

  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const reply = await chatReply([...(history || []), { role: "user", content: message }]);

  await prisma.chatMessage.createMany({
    data: [
      { userId, role: "user", content: message },
      { userId, role: "assistant", content: reply },
    ],
  });

  return NextResponse.json({ reply });
}

