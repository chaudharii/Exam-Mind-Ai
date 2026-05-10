// app/api/ai/generate-assignment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateAssignmentAnswer } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { question, subject, uid } = await req.json();
    if (!question || !subject || !uid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await generateAssignmentAnswer(question, subject);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Assignment generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
