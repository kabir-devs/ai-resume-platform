import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/openai";

// Accepts multipart/form-data with a "file" field (PDF or plain text).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  // Enforce free-tier resume analysis limit.
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const resumeCount = await prisma.resume.count({ where: { userId } });
  if ((sub?.plan ?? "FREE") === "FREE" && resumeCount >= 3) {
    return NextResponse.json(
      { error: "Free plan limit reached (3 analyses). Upgrade to Pro for unlimited analyses." },
      { status: 402 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else {
    text = buffer.toString("utf-8");
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Could not extract text from file" }, { status: 422 });
  }

  const result = await analyzeResume(text);

  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName: file.name,
      rawText: text,
      analysis: {
        create: {
          score: result.score,
          strengths: JSON.stringify(result.strengths),
          weaknesses: JSON.stringify(result.weaknesses),
          suggestions: JSON.stringify(result.suggestions),
          extractedSkills: JSON.stringify(result.extractedSkills),
        },
      },
    },
    include: { analysis: true },
  });

  return NextResponse.json({ resumeId: resume.id, ...result });
}

