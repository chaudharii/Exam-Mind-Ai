// app/api/ai/generate-notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateNotes } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { subject, topic, noteType, uid } = await req.json();
    if (!subject || !topic || !uid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await generateNotes(topic, subject, noteType || "short");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notes generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
