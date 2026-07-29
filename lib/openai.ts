import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze resume text and return structured feedback.
export async function analyzeResume(resumeText: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical recruiter and resume coach. Analyze the given resume text and return STRICT JSON with keys: score (0-100 integer), strengths (array of strings), weaknesses (array of strings), suggestions (array of strings, actionable), extractedSkills (array of strings).",
      },
      { role: "user", content: resumeText.slice(0, 12000) },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw) as {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    extractedSkills: string[];
  };
}

// Generate interview questions tailored to a role + resume context.
export async function generateInterviewQuestions(role: string, resumeText?: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior interviewer. Generate a JSON object with key 'questions': an array of 10 interview questions (mix of behavioral and technical) tailored to the target role and, if provided, the candidate's resume background. Each item: { question: string, type: 'behavioral'|'technical', tip: string }.",
      },
      {
        role: "user",
        content: `Target role: ${role}\n\nResume context:\n${(resumeText || "N/A").slice(0, 6000)}`,
      },
    ],
    temperature: 0.6,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(raw) as {
    questions: { question: string; type: string; tip: string }[];
  };
}

// Streaming-free simple chat completion for the chat interface.
export async function chatReply(history: { role: "user" | "assistant"; content: string }[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful, encouraging career coach assistant embedded in a resume/interview prep platform. Keep answers concise and actionable.",
      },
      ...history,
    ],
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content || "";
}

