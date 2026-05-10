// app/api/ai/analyze-syllabus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeSyllabus } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, subject, uid } = await req.json();
    if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await analyzeSyllabus(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Syllabus analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
