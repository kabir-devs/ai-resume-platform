import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const { role, resumeId } = await req.json();

  if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

  let resumeText: string | undefined;
  if (resumeId) {
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    resumeText = resume?.rawText;
  }

  const result = await generateInterviewQuestions(role, resumeText);

  await prisma.interviewSet.create({
    data: { userId, role, questions: JSON.stringify(result.questions) },
  });

  return NextResponse.json(result);
}
