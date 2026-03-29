import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function extractJsonArray(text: string) {
    const trimmed = text.trim();

    if (trimmed.startsWith("[")) {
        return JSON.parse(trimmed);
    }

    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i) || trimmed.match(/```\s*([\s\S]*?)\s*```/i);
    if (fencedMatch?.[1]) {
        return JSON.parse(fencedMatch[1].trim());
    }

    const firstBracket = trimmed.indexOf("[");
    const lastBracket = trimmed.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
    }

    throw new Error("Could not extract JSON array from model response.");
}

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY in .env.local" },
                { status: 500 }
            );
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const body = await req.json();
        const { mode } = body;

        if (mode === "plan") {
            const { topic, level, capacity, duration, goal } = body;

            const prompt = `
Create a structured weekly learning plan.

Topic: ${topic}
Level: ${level}
Hours per week: ${capacity}
Duration: ${duration} weeks
Goal: ${goal}

Return ONLY a JSON array.
No explanation.
No markdown.
No code fences.

Format:
[
  {
    "week": 1,
    "title": "Week 1",
    "focus": "short focus title",
    "goal": "what the user should achieve this week"
  }
]
`;

            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            });

            const text = completion.choices[0]?.message?.content ?? "[]";
            const plan = extractJsonArray(text);

            return NextResponse.json({ plan });
        }

        if (mode === "chat") {
            const { question, topic, level, capacity, duration, goal } = body;

            const prompt = `
You are a helpful learning assistant for Loomeira.

The user is learning:
- Topic: ${topic}
- Level: ${level}
- Hours per week: ${capacity}
- Duration: ${duration} weeks
- Goal: ${goal}

User question:
${question}

Give a short, practical, encouraging answer.
`;

            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            });

            const reply =
                completion.choices[0]?.message?.content?.trim() ||
                "Sorry, I couldn't respond right now.";

            return NextResponse.json({ reply });
        }

        return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    } catch (error: any) {
        console.error("LOOMEIRA API ERROR:", error);

        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "Unknown server error",
            },
            { status: 500 }
        );
    }
}