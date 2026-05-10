// app/api/ai/generate-handwriting/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateHandwrittenHTML } from "@/services/handwriting";

export async function POST(req: NextRequest) {
  try {
    const { question, answer, studentName, subject, inkColor } = await req.json();
    if (!question || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const html = generateHandwrittenHTML(answer, studentName || "Student", subject || "Assignment", question, { inkColor });
    return NextResponse.json({ html });
  } catch (error) {
    console.error("Handwriting generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
