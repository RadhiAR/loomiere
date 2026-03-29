import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { topic, level, hours, duration, goal } = body;

        const prompt = `
Create a structured learning plan.

Topic: ${topic}
Level: ${level}
Hours per week: ${hours}
Duration: ${duration} weeks
Goal: ${goal}

Return JSON in this format:
[
  { "week": 1, "title": "...", "tasks": ["...", "..."] }
]
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const text = response.choices[0].message.content || "[]";

        return NextResponse.json({ plan: text });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}