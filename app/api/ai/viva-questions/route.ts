// app/api/ai/viva-questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateVivaQuestions } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { subject, topic, uid } = await req.json();
    if (!subject || !topic || !uid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await generateVivaQuestions(subject, topic);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Viva question error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
